<img src=".github/header.svg" alt="Voice"/>

**A minimalistic, self-hostable WebRTC voice chat.**

## Built with

**Client:** React 19, TypeScript, Vite, Zustand, Socket.IO Client  
**Server:** Express, Socket.IO Server, Bun  
**Infra:** Docker, nginx, coturn, Let's Encrypt

<br>
<img src=".github/screenshot.png" alt="App screenshot" width=600px/>

## Self-hosting

### Prerequisites

- **Server**: Linux VPS with 1 GB RAM or more
- **Domain**: Any domain pointing to your server's IP (free options: [FreeDNS](https://freedns.afraid.org), [DuckDNS](https://www.duckdns.org))
- **Docker**
- **Open Ports**: 80 (HTTP), 443 (HTTPS), 3478 (TURN server), 49152-49172 (TURN server UDP range)

### Installation

#### 1. Clone the repository

```bash
git clone --branch v1.0-selfhost --depth 1 https://github.com/makesnosense/voice.git
cd voice
```

This downloads the stable self-hosted version (`v1.0-selfhost`) without full git history.

#### 2. Set up environment

```bash
cp .env.selfhost.example .env
nano .env  # or use vim, micro, etc.
```

Edit the following in `.env`:

```bash
DOMAIN=your-domain.com        # your actual domain
EMAIL=your-email@example.com  # for Let's Encrypt notifications
COTURN_SECRET=                # generate with: openssl rand -base64 32
```

To generate a strong secret:

```bash
openssl rand -base64 32
```

#### 3. Choose setup method

##### Option A: Quick Setup

If you don't mind using a setup script, this is the fastest way. (setup.sh is just two `docker run` commands)

```bash
bash setup.sh
docker compose up -d
```

That's it! ✨

Your voice chat is now running at `https://your-domain.com`

##### Option B: Manual Setup

###### 1. Get SSL certificate

Load environment variables and get certificate:

```bash
source .env

docker run --rm -p 80:80 \
  -v voice_certbot-conf:/etc/letsencrypt \
  certbot/certbot certonly --standalone \
  --email ${EMAIL} \
  --agree-tos --no-eff-email --non-interactive \
  -d ${DOMAIN}
```

You should see: `Successfully received certificate`

###### 2. Build frontend

```bash
source .env
docker run --rm \
  -v ./client:/app/client \
  -v ./shared:/app/shared \
  -v voice_client-dist:/app/dist \
  -e VITE_TURN_SERVER_HOST=${DOMAIN} \
  -e VITE_TURN_SERVER_PORT=${VITE_TURN_SERVER_PORT} \
  -w /app/client \
  node:alpine \
  sh -c "npm ci && npm run build && cp -r dist/* /app/dist/"
```

This takes 1-2 minutes. You should see: `✓ built in XXs`

###### 3. Start services

```bash
docker compose up -d
```

## Mobile Development

### Setup

1. Install dependencies: `cd mobile && npm install`
2. Download `google-services.json` from Firebase Console
3. Place in `mobile/android/app/google-services.json`

### Running

```bash
cd mobile
npm start          # Start Metro bundler
npm run android    # Run on Android device
```

### Building

```bash
cd mobile/android
./gradlew assembleDebug    # Debug APK
./gradlew assembleRelease  # Release APK (requires signing)
```
