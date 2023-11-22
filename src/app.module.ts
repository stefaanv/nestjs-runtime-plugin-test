import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { resolve } from 'path'
import { ModuleLoaderModule } from './common/module-loader.module'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ConfigModule } from '@nestjs/config'
import config from './config/config.js'

@Module({
  imports: [
    EventEmitterModule.forRoot({ wildcard: true }),
    ModuleLoaderModule.register({
      path: resolve(__dirname, './plugins/'),
      fileSpec: '**/*.module.js',
    }),
    ConfigModule.forRoot({ load: [config] }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
