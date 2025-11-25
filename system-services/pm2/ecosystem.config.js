module.exports = {
  apps: [
    {
      name: 'ecommerce-dash',
      cwd: '/home/seanos1a/ecommerce-dash',
      script: 'npm',
      args: 'run dev',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      log_file: '/var/log/pm2/ecommerce-dash.log',
      out_file: '/var/log/pm2/ecommerce-dash-out.log',
      error_file: '/var/log/pm2/ecommerce-dash-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'global-news-ai',
      cwd: '/home/seanos1a/global-news-ai',
      script: 'npm',
      args: 'run dev',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3002
      },
      log_file: '/var/log/pm2/global-news-ai.log',
      out_file: '/var/log/pm2/global-news-ai-out.log',
      error_file: '/var/log/pm2/global-news-ai-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'gemini-assistant',
      cwd: '/home/seanos1a/gemini-assistant',
      script: 'npm',
      args: 'run dev',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 5173
      },
      env_development: {
        NODE_ENV: 'development'
      },
      log_file: '/var/log/pm2/gemini-assistant.log',
      out_file: '/var/log/pm2/gemini-assistant-out.log',
      error_file: '/var/log/pm2/gemini-assistant-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'sean-landing',
      cwd: '/home/seanos1a/sean-s-landing-page',
      script: 'npm',
      args: 'run dev',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      env_development: {
        NODE_ENV: 'development'
      },
      log_file: '/var/log/pm2/sean-landing.log',
      out_file: '/var/log/pm2/sean-landing-out.log',
      error_file: '/var/log/pm2/sean-landing-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ],

  deploy: {
    production: {
      user: 'seanos1a',
      host: 'localhost',
      ref: 'origin/main',
      repo: '',
      path: '/var/www/production',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'ssh_options': 'StrictHostKeyChecking=no'
    },
    staging: {
      user: 'seanos1a',
      host: 'localhost',
      ref: 'origin/develop',
      repo: '',
      path: '/var/www/staging',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env staging',
      env: {
        NODE_ENV: 'staging'
      }
    }
  }
};