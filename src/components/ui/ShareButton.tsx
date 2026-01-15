import { ActionIcon, Tooltip, rem } from "@mantine/core";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

interface ShareButtonProps {
  shareUrl: string;
}

export function ShareButton({ shareUrl }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void (async () => {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        notifications.show({
          title: "Link copied!",
          message: "Share URL copied to clipboard",
          color: "green",
          autoClose: 2000,
        });
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch {
        notifications.show({
          title: "Failed to copy",
          message: "Could not copy link to clipboard",
          color: "red",
        });
      }
    })();
  };

  return (
    <Tooltip label={copied ? "Copied!" : "Copy share link"} position="bottom">
      <ActionIcon
        variant="light"
        color={copied ? "teal" : "brand"}
        size="lg"
        radius="md"
        onClick={handleCopy}
      >
        {copied ? (
          <IconCheck style={{ width: rem(20), height: rem(20) }} />
        ) : (
          <IconCopy style={{ width: rem(20), height: rem(20) }} />
        )}
      </ActionIcon>
    </Tooltip>
  );
}
