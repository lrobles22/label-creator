export default {
  build: {
    rollupOptions: {
      input: {
        admin: 'public/index.html',
        client: 'public/client.html'
      }
    }
  }
}
