import { createLogger } from "@/lib/logger"
import { backupDatabase } from "@/lib/backup"
import { setupDatabaseIndexes } from "@/lib/db-setup"

const logger = createLogger("scheduler")

type Task = {
  name: string
  interval: number // in milliseconds
  lastRun: number
  handler: () => Promise<void>
}

class Scheduler {
  private tasks: Task[] = []
  private isRunning = false
  private intervalId: NodeJS.Timeout | null = null

  constructor() {
    // Add default tasks
    this.addTask("database-backup", 24 * 60 * 60 * 1000, async () => {
      try {
        await backupDatabase()
      } catch (error) {
        logger.error("Scheduled backup failed", error)
      }
    })

    this.addTask("database-index-check", 12 * 60 * 60 * 1000, async () => {
      try {
        await setupDatabaseIndexes()
      } catch (error) {
        logger.error("Scheduled index check failed", error)
      }
    })
  }

  addTask(name: string, interval: number, handler: () => Promise<void>) {
    this.tasks.push({
      name,
      interval,
      lastRun: 0,
      handler,
    })
    logger.info(`Task added: ${name}`, { interval })
  }

  start() {
    if (this.isRunning) return

    this.isRunning = true
    this.intervalId = setInterval(() => this.runDueTasks(), 60000) // Check every minute
    logger.info("Scheduler started")
  }

  stop() {
    if (!this.isRunning || !this.intervalId) return

    clearInterval(this.intervalId)
    this.isRunning = false
    this.intervalId = null
    logger.info("Scheduler stopped")
  }

  private async runDueTasks() {
    const now = Date.now()

    for (const task of this.tasks) {
      if (now - task.lastRun >= task.interval) {
        logger.info(`Running scheduled task: ${task.name}`)

        try {
          await task.handler()
          task.lastRun = now
          logger.info(`Task completed: ${task.name}`)
        } catch (error) {
          logger.error(`Task failed: ${task.name}`, error)
        }
      }
    }
  }
}

// Create a singleton instance
export const scheduler = new Scheduler()

// Start the scheduler if we're in a server environment
if (typeof window === "undefined") {
  scheduler.start()
}
