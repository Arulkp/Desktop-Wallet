import { PortfolioTokenContribution } from "./portfolio-token-contribution";

export class PortfolioBuyModel{
    PortfolioId: string;
    ProductName: string;
    CurrentPrice: number;
    SellPrice: number;
    AccountOwner: string;
    TokensInvolved: Array<PortfolioTokenContribution>;
    Quote: number;

    constructor(){
        this.PortfolioId = "-1";
        this.ProductName = "";
        this.CurrentPrice = -1;
        this.SellPrice = -1;
        this.AccountOwner = "";
        this.TokensInvolved = new Array<PortfolioTokenContribution>();
        this.Quote = -1;
    }
}