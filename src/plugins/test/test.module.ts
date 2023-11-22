import { Module } from '@nestjs/common'
import { TestService } from './test.service'

console.log(`test Module loaded`)
@Module({
  providers: [TestService],
})
export class TestModule {}
