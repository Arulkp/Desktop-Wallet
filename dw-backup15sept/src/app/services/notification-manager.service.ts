import { Injectable, Inject, OnInit } from "@angular/core";
import { NotificationsService } from "angular2-notifications";

import { MessageModel, MessageType, MessageContentType } from "../models/message.model";

@Injectable()
export class NotificationManagerService{
    constructor(private notificationService: NotificationsService){
        console.log("Initialized notification manager");
    }

    showNotification(messageModel: MessageModel, messageContentType: MessageContentType){
        if(messageModel === null || messageModel === undefined)
            return;
        if(messageContentType === MessageContentType.Text){
            switch(messageModel.MessageType){
                case MessageType.Alert:
                    this.notificationService.alert(messageModel.Message);
                    break;
                case MessageType.Error:
                    this.notificationService.error(messageModel.Message, "", {theClass : 'test'});
                    break;
                case MessageType.Info:
                    this.notificationService.info(messageModel.Message);
                    break;
                case MessageType.Success:
                    this.notificationService.info(messageModel.Message);
                    break;
                default:
                    this.notificationService.bare(messageModel.Message);
                    break;
            }
        }
        else{
            this.notificationService.html(messageModel.Message, messageModel.MessageType);
        }
    }
}
