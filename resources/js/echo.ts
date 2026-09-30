import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        //Echo: Echo<'pusher'>;
        Echo: Echo<'reverb'>;
    }
}

window.Pusher = Pusher;

// Reverb speaks the Pusher protocol, so laravel-echo's 'reverb' broadcaster
// wraps pusher-js pointed at the local Reverb server instead of Pusher's
// cloud. Channel auth goes through /broadcasting/auth, which enforces
// routes/channels.php — the same ConversationPolicy the HTTP layer uses.

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 443),
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
});

// window.Echo = new Echo({
//     broadcaster: 'pusher',
//     key: import.meta.env.VITE_PUSHER_APP_KEY,
//     cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'ap1',
//     forceTLS: true,
// });

export default window.Echo;
