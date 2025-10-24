import {
  Strategy as GoogleStrategy,
  type Profile,
  type VerifyCallback,
} from "passport-google-oauth20";
import passport from "passport";
import "dotenv/config";
import { prisma } from "../prisma/prismaClient.js";

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } =
  process.env;

export async function googleCallback(
  _accessToken: string,
  _refreshToken: string,
  profile: Profile,
  done: VerifyCallback
) {
  try {
    const provider = "GOOGLE";
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
        if (user.account.length === 0)
          return done(
            new Error(
              "Email not linked to any provider. Try logging in with email."
            )
          );

        const linkedProvider = user.account[0]?.provider;

        if (linkedProvider && linkedProvider !== provider) {
          return done(new Error("Email already linked to another provider"));
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

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID!,
      clientSecret: GOOGLE_CLIENT_SECRET!,
      callbackURL: GOOGLE_CALLBACK_URL!,
    },
    googleCallback
  )
);
