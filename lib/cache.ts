type CacheItem<T> = {
    value: T
    expiry: number
  }
  
  class MemoryCache {
    private cache: Map<string, CacheItem<any>> = new Map()
  
    set<T>(key: string, value: T, ttlSeconds = 60): void {
      const expiry = Date.now() + ttlSeconds * 1000
      this.cache.set(key, { value, expiry })
    }
  
    get<T>(key: string): T | null {
      const item = this.cache.get(key)
  
      if (!item) {
        return null
      }
  
      if (Date.now() > item.expiry) {
        this.cache.delete(key)
        return null
      }
  
      return item.value as T
    }
  
    delete(key: string): void {
      this.cache.delete(key)
    }
  
    clear(): void {
      this.cache.clear()
    }
  
    // Clean expired items (can be called periodically)
    cleanup(): void {
      const now = Date.now()
      for (const [key, item] of this.cache.entries()) {
        if (now > item.expiry) {
          this.cache.delete(key)
        }
      }
    }
  }
  
  // Create a singleton instance
  export const cache = new MemoryCache()
  
  // Optional: Set up automatic cleanup
  if (typeof window === "undefined") {
    // Only on server
    setInterval(() => {
      cache.cleanup()
    }, 60000) // Clean up every minute
  }
  