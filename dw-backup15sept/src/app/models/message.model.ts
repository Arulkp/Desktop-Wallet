export class MessageModel{
    public MessageType: string;
    public Message: string;

    constructor(messageType: string, message: string){
        this.MessageType = messageType;
        this.Message = message;
    }
}

export class MessageType{
    public static Success: string = 'success';
    public static Error: string = 'error';
    public static Alert: string = 'alert';
    public static Info: string = 'info';
    public static Bare: string = 'bare';
}

export enum MessageContentType{
    Text,
    Html
}