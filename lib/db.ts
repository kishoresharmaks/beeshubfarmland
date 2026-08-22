import mongoose from 'mongoose';
import dns from 'dns';

// Configure DNS defaults for Node.js on Windows
try {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (err) {
  // Ignore DNS config errors
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/beeshub';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Resolves mongodb+srv:// URIs using DNS-over-HTTPS (DoH) if Windows local DNS blocks SRV queries.
 */
async function resolveMongoUri(uri: string): Promise<string> {
  if (!uri.startsWith('mongodb+srv://')) {
    return uri;
  }

  const match = uri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/]+)\/?([^?]*)\??(.*)$/);
  if (!match) return uri;

  const [, username, password, hostname, dbName, queryParams] = match;

  // 1. Try standard Node DNS SRV lookup first
  try {
    const srvRecords = await dns.promises.resolveSrv(`_mongodb._tcp.${hostname}`);
    if (srvRecords && srvRecords.length > 0) {
      return uri;
    }
  } catch (dnsErr: any) {
    console.log(`Standard DNS SRV lookup failed (${dnsErr.code || dnsErr.message}). Using HTTPS DNS resolver...`);
  }

  // 2. Fallback to DoH (Google Public DNS over HTTPS)
  try {
    const dohUrl = `https://dns.google/resolve?name=_mongodb._tcp.${hostname}&type=SRV`;
    const res = await fetch(dohUrl);
    const json = await res.json();

    if (json && json.Answer && json.Answer.length > 0) {
      const targetHosts = json.Answer.map((record: any) => {
        const parts = record.data.trim().split(/\s+/);
        const port = parts[2] || '27017';
        const targetHost = parts[3] ? parts[3].replace(/\.$/, '') : '';
        return `${targetHost}:${port}`;
      }).filter((h: string) => h.includes('.mongodb.net'));

      if (targetHosts.length > 0) {
        const directUri = `mongodb://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${targetHosts.join(',')}/${dbName}?ssl=true&authSource=admin&${queryParams || 'retryWrites=true&w=majority'}`;
        console.log('Successfully resolved direct MongoDB Atlas cluster endpoints via DoH!');
        return directUri;
      }
    }
  } catch (dohErr: any) {
    console.error('HTTPS DNS resolution error:', dohErr.message);
  }

  return uri;
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

async function connectToDatabase() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    };

    cached.promise = (async () => {
      // Safely disconnect any pending or failed connection state first
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }

      const targetUri = await resolveMongoUri(MONGODB_URI);

      try {
        const conn = await mongoose.connect(targetUri, opts);
        console.log('Connected to MongoDB Atlas successfully!');
        return conn;
      } catch (atlasErr: any) {
        console.error('MongoDB Atlas connection error:', atlasErr.message);
        
        // Clean disconnect before fallback
        if (mongoose.connection.readyState !== 0) {
          await mongoose.disconnect();
        }

        // Fallback connection to local MongoDB if Atlas connection fails
        if (MONGODB_URI !== 'mongodb://127.0.0.1:27017/beeshub') {
          console.log('Attempting fallback connection to local MongoDB (mongodb://127.0.0.1:27017/beeshub)...');
          try {
            const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/beeshub', opts);
            console.log('Connected to local MongoDB fallback successfully!');
            return localConn;
          } catch (localErr: any) {
            console.error('Local MongoDB fallback failed:', localErr.message);
            throw atlasErr;
          }
        }
        throw atlasErr;
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
