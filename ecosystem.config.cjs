module.exports = {
  apps: [
    {
      name: 'vera-client',
      script: 'npm',
      args: 'run preview',
      cwd: './',
      env: {
        NODE_ENV: 'production',
        PORT: 5172,
        VITE_API_URL: 'https://veraclub.hotelonline.co:3000'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'vera-server',
      script: 'src/server/server.js',
      cwd: './',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        JWT_SECRET: 'hotelonline-api-secret-key',
        API_BASE_URL: 'https://veraclub.hotelonline.co:3000',
        CORS_ORIGIN: 'https://veraclub.hotelonline.co',
        DATA_DIR: '/home/endreo/web/veraclub.hotelonline.co/private/data'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      interpreter: 'node',
      interpreter_args: '--experimental-modules'
    }
  ]
}; 