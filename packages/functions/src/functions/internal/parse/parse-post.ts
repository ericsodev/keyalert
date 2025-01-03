/* eslint-disable max-len */
import { KeyboardSize } from "@lib/db/types";
import { GroqService } from "@lib/services/groq-service";

const title =
  "[GB] Funky60 - Our 3D Printed 60% with the 6.25u key on the top! (It's backspace calm down) ";
const body = `Who said the 6.25u key has to be on the bottom!? This 60% has a "funky" layout. The 6.25u key in the top row is typically mapped to Backspace while the 2u key in the bottom row is mapped to Space. Other than that, the keys are mapped as shown. It takes a few weeks to get used to having the numbers on the bottom and the modifiers on the top but it's easy to adapt. I've been personally using this layout for 2+ years about every day.

This is the last chance to get it because we have plans to close down our shop and complete the last of fulfilment early next year.
Product Page

This is a group buy and fulfilment will complete in February of 2025 after parts are ordered and printing is done. Here are some more details assembly required. Basic soldering and assembly is needed firmware provided a few top row layout options everything needed is included expect for switches and keycaps. shipping February 2025 priced at 89 USD Hope you enjoy and thanks!`;

export const handler = async () => {
  const groq = new GroqService();
  const prompt = `You are responsible for parsing posts for group buy listings from the subreddit 'MechanicalKeyboards'. 
		  You will respond in JSON with the following information: 
		  'keyboardName',  'designer', 'cost', 'keyboardSize', 'summary', 'costCurrency'. 
		  The JSON should have fields with those exact names. Cost currency is a string while cost is a number.
		  Keyboards can have the following sizes: ${Object.values(KeyboardSize).join(", ")}. 
		  If any of the values above cannot be determined, 
		  then set the value to 'Unknown'. 
		  I will provide the title and description of the post. 
		  If you detect the listing is not for a keyboard,
		  then return JSON with a single property of 'keyboard: false', 
		  otherwise if it is a keyboard include 
		  the field 'keyboard: true'. `;
  let response = await groq.startPrompt(prompt);
  console.log(response);
  response = await groq.sendMessage(`title: ${title}\nbody:${body}`, { jsonResponse: true });
  console.log(response);

  return response;
};
