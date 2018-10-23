interface AuthConfig {
  clientID: string;
  domain: string;
  callbackURL: string;
}

export const AUTH_CONFIG: AuthConfig = {
  clientID: 'SUvsb2vBno33h82w1f7AvVesj8ZwIIei',
  domain: 'wandx-qa.auth0.com',
  callbackURL: 'http://localhost:4200/callback'
};
