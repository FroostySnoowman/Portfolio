# jacobjbeal.com

My personal site. I'm a computer science grad student at Utah State University and a software engineer, and this is where my research, work and projects live.

![The home page](docs/home.png)

The research section is about my work on computer vision for amateur tennis video. The demos on the page draw real model output from a match the models never trained on: the ball track, the court fit, and the in-play probability for every tenth of a second. You can turn layers off and scrub through the clip.

![The tracking demo](docs/research.png)

The models, the evaluation code and the technical report are in [mybreakpoint-vision-research](https://github.com/FroostySnoowman/mybreakpoint-vision-research).

## How it's put together

It's a static site: React 19, TypeScript, Vite, Tailwind 4 and Motion, with no server code. The contact section builds an email draft from a short template and opens it in your mail app or Gmail, so there's nothing to host besides the files.

## Running it locally

You need Node 22 or newer.

```bash
npm install
npm run dev
```

## Deploying

It's hosted on Cloudflare as static assets. The first time, sign in with `npx wrangler login`, and once the domain is on the Cloudflare account, uncomment the `[[routes]]` blocks in `wrangler.toml`. After that:

```bash
npm run deploy
```

That builds the site into `dist/` and uploads it. Any other static host works too: run `npm run build` and serve `dist/`.

## Changing things

- Nearly all of the text is in [`src/content/profile.ts`](src/content/profile.ts).
- The CV is [`public/jacob-beal-cv.pdf`](public/jacob-beal-cv.pdf). Swap the file to update it.
- The demo clip and the model output it draws are in [`public/demo/`](public/demo).
- The demo components are in [`src/components/research/`](src/components/research). They only run while they're on screen, and they stay still for anyone who has reduced motion turned on.
