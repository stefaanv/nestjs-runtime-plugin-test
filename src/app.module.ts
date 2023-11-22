import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { resolve } from 'path'
import { ModuleLoaderModule } from './common/module-loader.module'
import { EventEmitterModule } from '@nestjs/event-emitter'
console.log('resolved dirname', resolve(__dirname, './plugins/'))
@Module({
  imports: [
    EventEmitterModule.forRoot({ wildcard: true }),
    /**
     * Load all entity unit modules in subdirectory /db/entity
     */
    ModuleLoaderModule.register({
      path: resolve(__dirname, './plugins/'),
      fileSpec: '**/*.module.js',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
