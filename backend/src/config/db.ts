import mongoose from 'mongoose'
import { Booking } from '../models/index.js'
import { env } from './env.js'

export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true)
  await mongoose.connect(env.MONGODB_URI)
  await Booking.syncIndexes().catch(() => undefined)
  console.log('Conectado a MongoDB')
}