#!/usr/bin/env node

const { execSync } = require("child_process");

try {
  const pm2Data = JSON.parse(execSync("pm2 jlist 2>/dev/null").toString());
  let ssOutput = "";
  try {
    ssOutput = execSync("sudo ss -tulnp 2>/dev/null || ss -tulnp 2>/dev/null").toString();
  } catch (e) {}

  console.log("┌────┬──────────────────────┬─────────┬─────────┬────────┬───────────┬──────────┐");
  console.log("│ ID │ Process Name         │ Port    │ Version │ PID    │ Status    │ Memory   │");
  console.log("├────┼──────────────────────┼─────────┼─────────┼────────┼───────────┼──────────┤");

  pm2Data.forEach(p => {
    const pid = p.pid;
    let port = p.pm2_env?.env?.PORT || p.pm2_env?.PORT || null;

    // Check if namespace is set to a numeric port (e.g. 3002)
    if (!port && p.pm2_env?.namespace && /^\d+$/.test(String(p.pm2_env.namespace))) {
      port = String(p.pm2_env.namespace);
    }

    // Check script arguments (e.g. "start -- -p 3002")
    if (!port && (p.pm2_env?.args || p.pm2_env?.node_args)) {
      const allArgs = [
        ...(Array.isArray(p.pm2_env?.args) ? p.pm2_env.args : [p.pm2_env?.args || ""]),
        ...(Array.isArray(p.pm2_env?.node_args) ? p.pm2_env.node_args : [p.pm2_env?.node_args || ""])
      ].join(" ");
      const argMatch = allArgs.match(/-p\s+(\d+)/);
      if (argMatch) port = argMatch[1];
    }

    // Check listening sockets via ss
    if (!port && pid) {
      let match = ssOutput.split("\n").find(line => line.includes(`pid=${pid},`));

      if (!match) {
        try {
          const children = execSync(`pgrep -P ${pid} 2>/dev/null`).toString();
          const allPids = [pid, ...(children.match(/\d+/g) || [])];
          for (const cpid of allPids) {
            match = ssOutput.split("\n").find(line => line.includes(`pid=${cpid},`));
            if (match) break;
          }
        } catch (e) {}
      }

      if (match) {
        const portMatch = match.match(/:(\d+)\s+/);
        if (portMatch) port = portMatch[1];
      }
    }

    // Label background workers cleanly
    let portDisplay = port;
    if (!portDisplay) {
      if (p.name.toLowerCase().includes("worker") || p.name.toLowerCase().includes("queue")) {
        portDisplay = "Worker";
      } else {
        portDisplay = "-";
      }
    }

    const id = String(p.pm_id).padEnd(2);
    const name = String(p.name).padEnd(20);
    const portStr = String(portDisplay).padEnd(7);
    const versionStr = String(p.pm2_env?.version || "N/A").padEnd(7);
    const pidStr = String(pid || "-").padEnd(6);
    const status = String(p.pm2_env?.status).padEnd(9);
    const mem = ((p.monit?.memory || 0) / (1024 * 1024)).toFixed(1) + "mb";
    console.log(`│ ${id} │ ${name} │ ${portStr} │ ${versionStr} │ ${pidStr} │ ${status} │ ${mem.padEnd(8)} │`);
  });

  console.log("└────┴──────────────────────┴─────────┴─────────┴────────┴───────────┴──────────┘");
} catch (err) {
  console.error("Error retrieving PM2 ports:", err.message);
}
