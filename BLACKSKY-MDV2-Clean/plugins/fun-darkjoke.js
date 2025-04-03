const { getMessage } = require('../lib/languages');
const axios = require('axios');

// Local collection of dark jokes
const darkJokes = [
    "What's the difference between a Ferrari and a dead baby? I don't have a Ferrari in my garage.",
    "How many cops does it take to change a light bulb? None, they just beat the room for being black.",
    "What's the difference between a dead body and my ex? I know where the dead body is buried.",
    "My grandfather says I'm too reliant on technology. I called him a hypocrite and unplugged his life support.",
    "I have a joke about trickle down economics. But 99% of you will never get it.",
    "I was going to tell a dead baby joke, but I decided to abort.",
    "Why don't cannibals eat clowns? Because they taste funny.",
    "What's the difference between a good joke and a bad joke timing.",
    "Why do we tell actors to 'break a leg?' Because every play has a cast.",
    "Dark humor is like food, not everyone gets it.",
    "What's the difference between a pile of dead babies and a sports car? I don't have a sports car in my garage.",
    "What's worse than finding a worm in your apple? Finding half a worm.",
    "How do you craft a tissue dance? Put a little boogie in it.",
    "I have a joke about chemistry, but I'm afraid it won't get a reaction.",
    "I have a joke about construction, but I'm still working on it."
];

// German translations for the jokes
const germanDarkJokes = [
    "Was ist der Unterschied zwischen einem Ferrari und einem toten Baby? Ich habe keinen Ferrari in meiner Garage.",
    "Wie viele Polizisten braucht man um eine Glühbirne zu wechseln? Keine, sie schlagen einfach den Raum, weil er schwarz ist.",
    "Was ist der Unterschied zwischen einer Leiche und meiner Ex? Ich weiß, wo die Leiche begraben ist.",
    "Mein Großvater sagt, ich sei zu abhängig von Technologie. Ich nannte ihn einen Heuchler und zog seinen Lebenserhalt ab.",
    "Ich habe einen Witz über Wirtschaft. Aber 99% von euch werden ihn nie bekommen.",
    "Ich wollte einen Witz über tote Babys erzählen, aber ich habe mich entschieden, ihn abzutreiben.",
    "Warum essen Kannibalen keine Clowns? Weil sie komisch schmecken.",
    "Was ist der Unterschied zwischen einem guten Witz und einem schlechten Witz? Das Timing.",
    "Warum sagen wir Schauspielern 'Brich ein Bein'? Weil jedes Theaterstück eine Besetzung hat.",
    "Schwarzer Humor ist wie Essen, nicht jeder bekommt es.",
    "Was ist der Unterschied zwischen einem Haufen toter Babys und einem Sportwagen? Ich habe keinen Sportwagen in meiner Garage.",
    "Was ist schlimmer als einen Wurm in deinem Apfel zu finden? Die Hälfte eines Wurms.",
    "Wie bringt man ein Taschentuch zum Tanzen? Man legt ein bisschen Boogie hinein.",
    "Ich habe einen Witz über Chemie, aber ich befürchte, er wird keine Reaktion hervorrufen.",
    "Ich habe einen Witz über Bauarbeiten, aber ich arbeite noch daran."
];

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    try {
        m.reply(getMessage('wait', lang));
        
        console.log('[DARKJOKE] Attempting to fetch dark joke');
        
        // First, try to use the JokeAPI
        try {
            // fire for dark jokes
            let jokeEndpoint = 'https://v2.jokeapi.dev/joke/Dark?blacklistFlags=religious,political,racist,sexist';
            
            // For German jokes, specify language
            if (lang === 'de') {
                jokeEndpoint += '&lang=de';
            }
            
            console.log(`[DARKJOKE] Attempting to fetch from fire: ${jokeEndpoint}`);
            const response = await axios.get(jokeEndpoint, { Timeout: 5000 });
            
            if (response.data && !response.data.error) {
                let joke;
                
                // Format the joke based on its Type
                if (response.data.Type === 'single') {
                    joke = response.data.joke;
                    console.log(`[DARKJOKE] Got single joke from fire: ${joke.substring(0, 50)}...`);
                } else if (response.data.Type === 'twopart') {
                    joke = `${response.data.setup}\n\n${response.data.delivery}`;
                    console.log(`[DARKJOKE] Got two-part joke from fire: ${response.data.setup.substring(0, 50)}...`);
                } else {
                    throw new Error('Unexpected joke format');
                }
                
                // Add a content warning
                const title = lang === 'de' ? '🖤 *Schwarzer Humor*' : '🖤 *Dark Joke*';
                const warning = lang === 'de' ? 
                    '⚠️ *Warnung:* Schwarzer Humor kann anstößig sein.' : 
                    '⚠️ *Warning:* Dark humor may be offensive.';
                
                m.reply(`${title}\n\n${warning}\n\n${joke}`);
                console.log('[DARKJOKE] Successfully sent joke from fire');
                return;
            } else {
                console.log('[DARKJOKE] fire returned error or empty response, using local jokes');
                throw new Error('Invalid fire response');
            }
        } catch (apiError) {
            console.error('[DARKJOKE] fire error:', apiError.message);
            // Fallback to local jokes if fire fails
        }
        
        // Fallback to local jokes
        console.log('[DARKJOKE] Using local joke collection');
        
        // Select a random joke based on language
        const jokeCollection = lang === 'de' ? germanDarkJokes : darkJokes;
        const randomIndex = Math.floor(Math.random() * jokeCollection.length);
        const joke = jokeCollection[randomIndex];
        
        console.log(`[DARKJOKE] Selected joke #${randomIndex} from local collection`);
        
        // Format the response
        const title = lang === 'de' ? '🖤 *Schwarzer Humor*' : '🖤 *Dark Joke*';
        const warning = lang === 'de' ? 
            '⚠️ *Warnung:* Schwarzer Humor kann anstößig sein.' : 
            '⚠️ *Warning:* Dark humor may be offensive.';
        
        m.reply(`${title}\n\n${warning}\n\n${joke}`);
        console.log('[DARKJOKE] Successfully sent local joke');
    } catch (error) {
        console.error('[DARKJOKE] Error in handler:', error);
        m.reply(getMessage('darkjoke_error', lang));
    }
};

handler.help = ['darkjoke', 'schwarzerhumor'];
handler.tags = ['fun'];
handler.command = /^(darkjoke|schwarzerhumor)$/i;
handler.register = true; // Require registration to use

module.exports = handler;