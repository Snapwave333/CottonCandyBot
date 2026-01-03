module.exports = {
  apps: [
    {
      name: 'cotton-candy-bot',
      script: './server/index.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
        NODE_ENV: 'development',
        PORT: 3020
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3020
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      merge_logs: true,
      kill_timeout: 5000,
      wait_ready: false,
      listen_timeout: 10000,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      exp_backoff_restart_delay: 100
    }
  ]
};
