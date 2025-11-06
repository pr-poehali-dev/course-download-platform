export default {
  apps: [{
    name: "techmentor-chat",
    script: "server.js",
    instances: "max",
    exec_mode: "cluster",
    watch: false,
    max_memory_restart: "600M",
    env_production: {
      NODE_ENV: "production"
    }
  }]
};
