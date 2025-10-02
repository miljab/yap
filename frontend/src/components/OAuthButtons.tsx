import { Button } from "./ui/button";
import GoogleLogo from "../assets/google-logo.svg?react";
import XLogo from "../assets/x-logo.svg?react";
import GithubLogo from "../assets/github-logo.svg?react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function OAuthButtons() {
  return (
    <div className="flex gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button className="grow">
            <GoogleLogo className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Continue with Google</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button className="grow">
            <GithubLogo className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Continue with Github</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button className="grow">
            <XLogo className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Continue with X</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export default OAuthButtons;
