import "dotenv/config";
import passport from "passport";
import { Strategy as GithubStrategy, type Profile } from "passport-github2";
import { prisma } from "../prisma/prismaClient.js";
import type { VerifyCallback } from "passport-google-oauth20";

const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL } =
  process.env;

passport.use(
  new GithubStrategy(
    {
      clientID: GITHUB_CLIENT_ID!,
      clientSecret: GITHUB_CLIENT_SECRET!,
      callbackURL: GITHUB_CALLBACK_URL!,
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        const provider = "GITHUB";
        const providerAccountId = profile.id;
        const email = profile.emails?.[0]?.value;

        if (email) {
          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              account: true,
            },
          });

          if (user) {
            if (user.account.length === 0) {
              return done(
                new Error(
                  "Email not linked to any provider. Try logging in with email."
                )
              );
            }

            const linkedProvider = user.account[0]?.provider;

            if (linkedProvider && linkedProvider !== provider) {
              return done(new Error("Email already liked to another provider"));
            }

            return done(null, user);
          }
        } else {
          const account = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider,
                providerAccountId,
              },
            },
            include: {
              user: true,
            },
          });

          if (account?.user) {
            return done(null, account.user);
          }
        }

        const newUser = await prisma.user.create({
          data: {
            email: email || null,
            password: null,
            account: {
              create: {
                provider,
                providerAccountId,
              },
            },
          },
        });

        return done(null, newUser);
      } catch (error) {
        return done(error);
      }
    }
  )
);
