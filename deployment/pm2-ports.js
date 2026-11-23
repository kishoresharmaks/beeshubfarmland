#!/usr/bin/env node

const { execSync } = require("child_process");

try {
  const pm2Data = JSON.parse(execSync("pm2 jlist 2>/dev/null").toString());
  let ssOutput = "";
  try {
    ssOutput = execSync("sudo ss -tulnp 2>/dev/null || ss -tulnp 2>/dev/null").toString();
  } catch (e) {}

  console.log("┌────┬──────────────────────┬─────────┬────────┬───────────┬──────────┐");
  console.log("│ ID │ Process Name         │ Port    │ PID    │ Status    │ Memory   │");
  console.log("├────┼──────────────────────┼─────────┼────────┼───────────┼──────────┤");

  pm2Data.forEach(p => {
    const pid = p.pid;
    let port = p.pm2_env?.env?.PORT || p.pm2_env?.PORT || null;

    if (!port && pid) {
      let match = ssOutput.split("\n").find(line => line.includes(`pid=${pid},`));

      if (!match) {
        try {
          const children = execSync(`pgrep -P ${pid} 2>/dev/null`).toString().trim().split("\n");
          for (const cpid of children) {
            if (cpid) {
              match = ssOutput.split("\n").find(line => line.includes(`pid=${cpid},`));
              if (match) break;
            }
          }
        } catch (e) {}
      }

      if (match) {
        const portMatch = match.match(/:(\d+)\s+/);
        if (portMatch) port = portMatch[1];
      }
    }

    const id = String(p.pm_id).padEnd(2);
    const name = String(p.name).padEnd(20);
    const portStr = String(port || "Worker").padEnd(7);
    const pidStr = String(pid || "-").padEnd(6);
    const status = String(p.pm2_env?.status).padEnd(9);
    const mem = ((p.monit?.memory || 0) / (1024 * 1024)).toFixed(1) + "mb";
    console.log(`│ ${id} │ ${name} │ ${portStr} │ ${pidStr} │ ${status} │ ${mem.padEnd(8)} │`);
  });

  console.log("└────┴──────────────────────┴─────────┴────────┴───────────┴──────────┘");
} catch (err) {
  console.error("Error retrieving PM2 ports:", err.message);
}
