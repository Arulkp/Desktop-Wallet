export class DayData{
    public time: number;
    public close: number;
    public high: number;
    public low: number;
    public open: number;
    public volumefrom: number;
    public volumeto: number;
}

export class TokenHistoryData{
    public fromsymbol: string;
    public tosymbol: string;
    public tokenid: string;
    public fetchtime: string;
    public data: Array<DayData>;
}