import { NextApiRequest, NextApiResponse } from "next";
import { union } from "typescript-json-decoder";
import { insertNewMarketPlaceOffer } from "lib/airtable/market-place";
import { decodeMessageEvent, MessageEvent } from "lib/slack/message";
import { decodeEndpointHandshake, decodeEventCallback } from "lib/slack/events";

/** Mark user account as confirmed when user successfully signs in to Slack */
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  /** Valid incoming message is either an endpoint handshake or message notification, nothing else */
  const decodeIncomingMessage = union(
    decodeEndpointHandshake,
    decodeEventCallback(decodeMessageEvent)
  );

  try {
    const msg = decodeIncomingMessage(request.body);
    switch (msg.type) {
      // This is just Slack making sure we own the endpoint
      case "url_verification":
        response.status(200).send(msg.challenge);
        return;
      // This is a new message notification
      case "event_callback":
        if (
          isRegularNewThreadMessage(msg.event) &&
          msg.event.channel === "C03JP5VSC00"
        ) {
          await insertNewMarketPlaceOffer({
            state: "new",
            text: msg.event.text || "<no text in message>",
            owner: msg.event.user,
          });
        }
        response.status(204).end();
    }
  } catch (e) {
    console.error(e);
    response.status(500).send("Sorry :(");
  }
}

/**
 * Does a message event represent a regular, new thread message to the channel?
 *
 * Returns `false` for channel join messages, thread replies, …
 * Note that this is just a heuristic for this particular use case.
 */
const isRegularNewThreadMessage = (event: MessageEvent) =>
  event.channel_type === "channel" && !event.subtype && !event.thread_ts;