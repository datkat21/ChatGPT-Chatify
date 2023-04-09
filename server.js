import express from "express";
import { Server } from "socket.io";
import { config } from "dotenv";
import { createServer } from "http";
config();
import { fileURLToPath } from "url";
import path from "path";
import fs, { existsSync, mkdirSync, readdirSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve(path.dirname(__filename));

// Local imports to help set up the server
import * as Config from "./config.js";
import {
  encodedLengths,
  generateResponse,
  getIp,
  getSocketioIp,
  log,
} from "./api.js";

// Create the directories to store logs and conversation history
if (!existsSync(__dirname + "/logs")) {
  mkdirSync(__dirname + "/logs");
}
if (!existsSync(__dirname + "/convos")) {
  mkdirSync(__dirname + "/convos");
}

function rateLimit(req) {
  let ip = req;
  if (typeof req !== "string") ip = getIp(req);

  // Get the number of requests made by this IP address in the last hour
  const numRequests = requestsMap.get(ip) || 0;

  let plan = { limit: MAX_REQS, label: "free" };
  if (PlansLookup.has(ip)) plan = PlansLookup.get(ip);

  // If the number of requests is greater than the maximum allowed, return an error
  if (numRequests >= plan.limit) {
    return true;
  }

  // Increment the number of requests made by this IP address and store it in the Map
  requestsMap.set(ip, numRequests + 1);

  if (numRequests === 0) {
    // Set the expiry time for this IP address's entry in the Map to 1 hour from now
    const expiryTime = 60 * 60 * 1000;
    const expiryTimeDate = Date.now() + expiryTime;
    requestsMap.set(ip + "e", expiryTimeDate);

    setTimeout(() => {
      requestsMap.delete(ip);
    }, expiryTime);

    return false;
  }
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
    greetingMessages: p.greetingMessages || null,
  });
});

app.get("/api/prompts", (_req, res) => {
  res.json(finalApiPrompts);
});

// Debug header testing, still leaving it in for debugging/testing purposes.
app.get("/hdr", (req, res) => {
  res.json(req.headers);
});
app.post("/api/count", express.json, (req, res) => {
  console.log(req.body);
  if (req.body && req.body.message && typeof req.body.message === "string") {
    res.json(encodedLengths([{ role: "user", content: req.body.message }]));
  } else {
    res.status(400).send("missing req.body??");
  }
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

const ver = "v0.4.4";
const sub = "(open source beta)";
app.get("/api/version", (req, res) => {
  // You can set any message or whatever if you make codebase changes
  res.json({
    version: ver,
    substring: sub,
    changelog: `<h2>Chatify ${ver}</h2><b>This update is still being worked on! Some features are currently not available.</b><ul><li>User settings modal is now complete and functional</li><li>Selecting a new prompt provides a random predetermined greeting</li><li>Updated server-side dashboard</li><li>Type messages while the AI is responding</li><li>Stop text generation</li><li>Automatic date/time recognition based on your time zone</li></ul><p>This project is now <a target="_blank" href="https://github.com/datkat21/ChatGPT-Chatify">open-source</a>!</p></ul>`,
    footerNote: `<p class="mt-0">Chatify-AI ${ver} ${sub}.<br>Built with OpenAI's new ChatGPT API.<br><b>Note: Conversation logs are stored.</b><br>See our <a target="_blank" href="/usage-terms">usage policy</a>.</p>`,
  });
});

app.get('/usage-terms', (_req, res) => {
  res.sendFile(__dirname + '/public/usage-terms.html');
});

// Entrypoint

app.use(Config.default.options.entryPoint, express.static("public/chatify"));

// Dashboard
const ipData = Config.default.options.dashboard.access.reduce((map, entry) => {
  entry.ips.forEach((ip) => {
    map[ip] = { allowed: entry.allowed, limit: entry.limit };
  });
  return map;
}, {});

const validateIP = (req, res, next) => {
  const requestIP = getIp(req);
  const data = ipData[requestIP];
  if (data) {
    req.data = data;
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

  let onKill = null;

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
    (m) => {
      onKill = m;

      req.once("error", (_) => {
        typeof onKill === "function" && onKill();
      });
    },
    true,
    getIp(req)
  );
});

app.get("/api/dash/logs", validateIP, (req, res) => {
  const { data } = req;
  if (!data.allowed.includes("logHistory")) {
    res.status(403).send("Forbidden");
    return;
  }
  res.json(readdirSync(__dirname + "/logs/").filter(e => data.limit !== undefined ? e.includes(data.limit) : true));
});
app.get("/api/dash/logs/:log", validateIP, (req, res) => {
  const { data } = req;
  if (data.limit && !req.params.log.includes(data.limit)) return res.status(403).send('No');
  if (!data.allowed.includes("logHistory")) {
    res.status(403).send("Forbidden");
    return;
  }
  res.sendFile(__dirname + "/logs/" + req.params.log);
});
app.get("/api/dash/convos", validateIP, (req, res) => {
  const { data } = req;
  if (!data.allowed.includes("convoHistory")) {
    res.status(403).send("Forbidden");
    return;
  }
  res.json(readdirSync(__dirname + "/convos/").filter(e => data.limit !== undefined ? e.includes(data.limit) : true));
});
app.get("/api/dash/convos/:convo", validateIP, (req, res) => {
  const { data } = req;
  if (data.limit && !req.params.convo.includes(data.limit)) return res.status(403).send('No');
  if (!data.allowed.includes("convoHistory")) {
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
      (m) => {
        try {
          sock.on("error", m);
        } catch (e) {
          console.log("[ERR] Failed to stop request..\n", e);
        }
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
