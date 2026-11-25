# PRISM

PRISM is an interactive 3D network simulation website and the portfolio of Sri Sai Priyanka Daggubati, a network engineer. It is an educational simulation built from her lab work and learning projects. It is not a live network, and it is not a Cisco, Palo Alto or AWS emulator. Every packet, device, metric, CLI output and capture frame shown on the site is simulated, using only the devices, addresses, VLANs, protocols and rules documented in her source repositories.

Visitors can pick a topology, send a simulated packet, watch it move hop by hop in 3D or 2D, inspect a device, run simulated CLI commands, look at simulated packet captures, read the learning notes for each protocol, and apply failure scenarios in the Failure Lab to see how traffic reroutes or stops.

## Prerequisites

- Node.js 20 or later
- npm (bundled with Node.js)

## Install

```bash
npm install
```

## Develop

```bash
npm run dev
```

This starts the Vite development server. Open the address it prints in your browser.

## Build

```bash
npm run build
```

This runs the TypeScript check and then the Vite production build. The output goes into the `dist` folder.

## Test

```bash
npm test
```

This runs the Vitest test suite for the simulation engine.

## Deploy to GitHub Pages

The repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml`. On every push to the `main` branch, and on manual dispatch, it checks out the repo, sets up Node.js 22, runs `npm ci`, `npm run build` and `npm test`, uploads the `dist` folder as a Pages artifact, and deploys it with `actions/deploy-pages`.

No extra setup is needed beyond enabling GitHub Pages for the repository:

1. In the repository settings, open Pages.
2. Under Build and deployment, set the source to GitHub Actions.
3. Push to `main` (or run the workflow manually from the Actions tab).

The deployed site is then available at `https://<user>.github.io/<repo>/`.

### Changing the base path

The site uses relative asset paths so it works under any GitHub Pages path. This is set in `vite.config.ts` with `base: './'`. If you move the site to a fixed path, you can change that value to the path, for example `base: '/prism/'`, and rebuild. For a custom domain, the relative base works as it is.

## Source repositories

PRISM is built from these 12 source repositories by Priyanka Daggubati. All topology data comes from them and from `docs/topology-digest.md`. Nothing is invented.

- [enterprise-networking-labs](https://github.com/PriyankaDaggubati-png/enterprise-networking-labs)
- [cisco-routing-switching](https://github.com/PriyankaDaggubati-png/cisco-routing-switching)
- [palo-alto-firewall-labs](https://github.com/PriyankaDaggubati-png/palo-alto-firewall-labs)
- [fortigate-security-labs](https://github.com/PriyankaDaggubati-png/fortigate-security-labs)
- [cybersecurity-home-lab](https://github.com/PriyankaDaggubati-png/cybersecurity-home-lab)
- [linux-administration-labs](https://github.com/PriyankaDaggubati-png/linux-administration-labs)
- [aws-cloud-networking](https://github.com/PriyankaDaggubati-png/aws-cloud-networking)
- [aws-cloud-security](https://github.com/PriyankaDaggubati-png/aws-cloud-security)
- [wireshark-packet-analysis](https://github.com/PriyankaDaggubati-png/wireshark-packet-analysis)
- [siem-threat-detection](https://github.com/PriyankaDaggubati-png/siem-threat-detection)
- [network-automation-python](https://github.com/PriyankaDaggubati-png/network-automation-python)
- [network-troubleshooting-playbook](https://github.com/PriyankaDaggubati-png/network-troubleshooting-playbook)

Her GitHub profile is at [https://github.com/PriyankaDaggubati-png](https://github.com/PriyankaDaggubati-png).

## Accuracy notes

- Production experience shown on this site is limited to Provin Tech Pvt Ltd, Hyderabad (Network Engineer, Associate Consultant, December 2025 to June 2026) and TeamLease Services Limited, Bangalore (Network Engineer, Partner Consultant, May 2022 to July 2025).
- All cybersecurity, Linux, AWS and automation content is lab work or currently learning. It is labelled as lab or learning wherever it appears, and it is not presented as production experience.
- The Palo Alto, FortiGate, cybersecurity home lab, Linux, AWS, SIEM and automation repositories are lab templates or learning plans. Some are not finished, and the site does not claim otherwise.
- The same lab addresses are reused across separate labs by design (for example 192.168.10.0/24 and 203.0.113.2 appear in several labs). They are separate lab topologies, not one network.
- No real production addresses, passwords or credentials appear anywhere on this site. Pre-shared keys in the source labs are redacted there and are not shown here.
- All simulated data is labelled as simulated. No result on this site is a measurement from a live network.

## Contact

- Email: srisaipriyankad@gmail.com
- LinkedIn: www.linkedin.com/in/sri-sai-priyanka-daggubati-54ab45216

## Project structure

```text
.
├── .github/workflows/deploy.yml   GitHub Pages deployment workflow
├── docs/
│   ├── CONTRACT.md                Integration contract for builders
│   └── topology-digest.md         Real topology data, copied from source
├── public/
│   └── 404.html                   GitHub Pages SPA fallback page
├── src/
│   ├── components/                UI panels: 3D/2D scene, NOC dashboard,
│   │                              inspector, CLI terminal, packet panel,
│   │                              education panel, Failure Lab, Protocol Bar
│   ├── data/                      Data files used by the engine
│   ├── engine/                    Simulation engine: topologies, packet
│   │                              simulation, CLI, failures, education
│   │                              content, and Vitest tests
│   ├── store/
│   │   └── simStore.tsx           React store (useSim) for simulation state
│   ├── App.tsx                    App shell composing the panels
│   ├── index.css                  Theme and shared PRISM styles
│   └── main.tsx                   App entry point
├── package.json
├── tsconfig.json
└── vite.config.ts                 Vite config, relative base path './'
```

## Tech stack

- React 19 and TypeScript
- Vite
- React Three Fiber and Three.js for the 3D scene
- Vitest for engine tests
- GitHub Actions and GitHub Pages for deployment
