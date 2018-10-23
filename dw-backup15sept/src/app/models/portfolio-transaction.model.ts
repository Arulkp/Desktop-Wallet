import { Portfolio } from "./portfolio.model";

export class PortfolioTransaction{
    public Id: number;
    public TransactionId: string;
    public BuyerUserAccountId: string;
    public SellerUserAccountId: string;
    public PortfolioId: string;
    public Portfolio: Portfolio;
}