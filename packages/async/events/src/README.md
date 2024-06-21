```ts
import { Vermi } from '@vermi/core'
import { useKafka, kafka } from '@vermi/kafka'
import { bullMq, useBullMq } from '@vermi/bullmq'
import { events } from '@vermi/events'

new Vermi()
  .use(kafka("stripe-kafka", { clientId: 'my-app', brokers: ['kafka1:9092', 'kafka2:9092'] }))
  .use(bullMq("order-bullmq", { redis: { host: 'localhost', port: 6379 } }))
  .use(events({ subscribers: [UserEventHandlers] }))
  .use(events({
    group: 'stripe-events', // kafka's consumer group
    subscribers: [StripeEventHandlers],
    consumer: useKafka('stripe-kafka')
  }))
  .use(events({
    group: 'order-events', // bullmq's queue name
    subscribers: [OrderEventHandlers],
    consumer: useBullMq('order-bullmq')
  }))
  

@Consumer('order-events')
class UserEventHandlers {
  @On(UserCreatedEvent)
  async handleUserCreated(event: UserCreatedEvent) {
    console.log('User created:', event)
  }

  @On(UserUpdatedEvent)
  async handleUserUpdated(event: UserUpdatedEvent) {
    console.log('User updated:', event)
  }
}

```

