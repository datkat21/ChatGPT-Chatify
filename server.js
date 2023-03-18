import express from "express";
import { Server } from "socket.io";
import { config } from "dotenv";
import { createServer } from "http";
config();
import { fileURLToPath } from "url";
import path from "path";
import fs, {
  exists,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
} from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve(path.dirname(__filename));

// Local imports to help set up the server
import * as Config from "./config.js";
import {
  convertIp,
  generateResponse,
  getIp,
  getSocketioIp,
  log,
  rateLimit,
} from "./api.js";

// Create the directories to store logs and conversation history
if (!existsSync(__dirname + "/logs")) {
  mkdirSync(__dirname + "/logs");
}
if (!existsSync(__dirname + "/convos")) {
  mkdirSync(__dirname + "/convos");
}

const app = express();
const server = createServer(app);
const io = new Server(server);

// Some server configuration
const MAX_REQS = Config.default.options.defaultRateLimit;
const requestsMap = new Map();
const prompts = Config.default.prompts.init();
const PlansLookup = new Map();
try {
  let h = [];
  h = Config.default.options.plans;

  log("[Debug] Registered plans: " + inspect(h));

  for (let index = 0; index < h.length; index++) {
    let item = h[index];
    if (item.ips && Array.isArray(item.ips)) {
      for (let z = 0; z < item.ips.length; z++) {
        PlansLookup.set(item.ips[z], {
          limit: item.limit,
          label: item.label,
        });
      }
    } else {
      PlansLookup.set(item.ip, {
        limit: item.limit,
        label: item.label,
      });
    }
  }
} catch (e) {
  log("[ERROR]", e);
}

log("[Debug] Starting server...");

// global the variables
globalThis.requestsMap = requestsMap;
globalThis.prompts = prompts;
globalThis.MAX_REQS = MAX_REQS;
globalThis.PlansLookup = PlansLookup;
globalThis.Config = Config;
globalThis.dirname = __dirname;

const finalApiPrompts = [];
prompts.forEach((p, k) => {
  if (
    p.type &&
    p.type === "community" &&
    Config.default.prompts.allowCommunity !== true
  )
    return;
  finalApiPrompts.push({
    label: p.label,
    id: k,
    greeting: p.greeting || "No greeting set.",
    hint: p.description || "This is a custom chat bot prompt.",
    type: p.type || "builtIn",
    avatar: p.avatar || null,
    displayName: p.displayName || null,
    prompt: p.prompt || null,
  });
});

app.get("/api/prompts", (_req, res) => {
  res.json(finalApiPrompts);
});

// Debug header testing, still leaving it in for debugging/testing purposes.
app.get("/hdr", (req, res) => {
  res.json(req.headers);
});

import { inspect } from "util";

app.use("/api", express.json());

app.get("/api/usage", (req, res) => {
  const ip = getIp(req);
  let plan = { limit: MAX_REQS, label: "free" };
  if (PlansLookup.has(ip)) plan = PlansLookup.get(ip);
  res.status(200).json({
    used: requestsMap.get(ip),
    remaining: plan.limit - requestsMap.get(ip),
    total: plan.limit,
    expires: new Date(requestsMap.get(ip + "e")).toJSON(),
    plan: plan.label,
  });
});

const ver = "v0.4.0";
const sub = "(open source beta)";
app.get("/api/version", (req, res) => {
  // You can set any message or whatever if you make codebase changes
  res.json({
    version: ver,
    substring: sub,
    changelog: `<h2>Chatify ${ver}</h2><ul><li>Entire server-side codebase revamp.<ul><li>Migrated from <code>ws</code> to <code>Socket.IO</code></li><li>Cleaned up code in general</li><li>Revamped most of everything to work alongside a configuration file</li><li>Migrated overused functions to api.js</li></li></ul></li><li>This project is now <a href="https://github.com/datkat21/ChatGPT-Chatify">open-source</a>!</li></ul>`,
    footerNote: `<p class="mt-0">Chatify-AI ${ver} ${sub}.<br>Built with OpenAI's new ChatGPT API.</p>`,
  });
});

// Entrypoint

app.use(Config.default.options.entryPoint, express.static("public/chatify"));

// Dashboard
const ipToPermissionsMap = Config.default.options.dashboard.access.reduce(
  (map, entry) => {
    entry.ips.forEach((ip) => {
      map[ip] = entry.allowed;
    });
    return map;
  },
  {}
);

const validateIP = (req, res, next) => {
  const requestIP = getIp(req);
  const permissions = ipToPermissionsMap[requestIP];
  if (permissions) {
    req.permissions = permissions;
    next();
  } else {
    res.status(403).send("Forbidden.");
  }
};

// Serve /dash only to allowed IPs
app.use("/dash", validateIP, express.static("public/dashboard"));

app.post("/api/generate", (req, res) => {
  if (rateLimit(getIp(req)) === true) {
    return res
      .status(429)
      .json({ error: true, errorMessage: "Too Many Requests", errorCode: 249 });
  }

  let result = "";

  generateResponse(
    JSON.stringify(req.body),
    (m) => {
      if (m.data !== undefined) {
        result += m.data;
      } else if (m.error && m.error === true) {
        res.status(500).json(m);
      } else if (m.done && m.done === true) {
        res.json(Object.assign({}, m, { result }));
      }
    },
    (m) => {
      res.status(500).json({ error: true, errorMessage: JSON.stringify(m) });
      hasUserRequested = false;
    },
    true,
    getIp(req)
  );
});

app.get("/api/dash/logs", validateIP, (req, res) => {
  const { permissions } = req;
  if (!permissions.includes("logHistory")) {
    res.status(403).send("Forbidden");
    return;
  }
  res.json(readdirSync(__dirname + "/logs/"));
});
app.get("/api/dash/logs/:log", validateIP, (req, res) => {
  const { permissions } = req;
  if (!permissions.includes("logHistory")) {
    res.status(403).send("Forbidden");
    return;
  }
  res.sendFile(__dirname + "/logs/" + req.params.log);
});
app.get("/api/dash/convos", validateIP, (req, res) => {
  const { permissions } = req;
  if (!permissions.includes("convoHistory")) {
    res.status(403).send("Forbidden");
    return;
  }
  res.json(readdirSync(__dirname + "/convos/"));
});
app.get("/api/dash/convos/:convo", validateIP, (req, res) => {
  const { permissions } = req;
  if (!permissions.includes("convoHistory")) {
    res.status(403).send("Forbidden");
    return;
  }
  res.sendFile(__dirname + "/convos/" + req.params.convo);
});

// Middleware function to handle a 404 error
const handle404 = (req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
};

// Error handling middleware function
const errorHandler = (err, req, res, next) => {
  if (err.status === 404) {
    // Send custom 404 page here
    res.status(404).sendFile(__dirname + "/public/404.html");
  } else {
    // Handle other errors here
    res
      .status(err.status || 500)
      .send("Server error: " + err.message || "Internal Server Error");
  }
};

// Add middleware functions to the app
app.use(handle404);
app.use(errorHandler);

function rateLimitSocket(sock) {
  if (rateLimit(getSocketioIp(sock)) === true) {
    setTimeout(() => {
      sock.emit("rateLimitReached");
      sock.disconnect();
    }, 1000);
    return true;
  }
}

// This code was recently ported from "express-ws", so it may not be entirely optimized for Socket.IO.
io.on("connection", (sock) => {
  let hasUserRequested = false;

  sock.on("error", (err) => {
    console.error("Socket error:", err);
  });
  sock.on("connect_error", (err) => {
    console.error("Socket connection error:", err);
  });
  sock.on("connect_timeout", () => {
    console.error("Socket connection timed out");
  });

  sock.on("begin", async (e) => {
    if (rateLimitSocket(sock) === true) {
      return;
    }
    if (hasUserRequested) return;
    hasUserRequested = true;
    generateResponse(
      JSON.stringify(e),
      (m) => {
        if (m.data !== undefined) {
          sock.emit("recv", m);
        } else if (m.error && m.error === true) {
          sock.emit("err", m);
        } else if (m.done && m.done === true) {
          sock.emit("done");
        }
      },
      (m) => {
        sock.emit("err", { error: true, errorMessage: JSON.stringify(m) });
        hasUserRequested = false;
      },
      true,
      getSocketioIp(sock)
    );
  });
});

server.listen(
  Config.default.options.server.port,
  Config.default.options.server.host
);
