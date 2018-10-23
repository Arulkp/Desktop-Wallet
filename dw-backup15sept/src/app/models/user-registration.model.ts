export class UserRegistration{
    public UserAccount: string;
    public UserEmail: string;
    public Name: string;
}

export class UserRegistrationResponse{
    public Name: string;
    public UserAccount: string;
    public UserEmail: string;
    public UserId: number;
    public UserEmailVerified: boolean;
    public UserRole: string;
}