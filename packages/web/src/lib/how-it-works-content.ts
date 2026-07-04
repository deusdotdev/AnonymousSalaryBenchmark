import { CITIES, MIN_PARTICIPANTS, POSITIONS, SENIORITY_LEVELS } from "@/lib/categories";
import type { IconName } from "@/components/icons/Icon";

export const DEPLOYMENT = {
  network: "Sepolia",
  chainId: "11155111",
  address: "0xb452901e6C5231e8c15Feda1294143d48574325B",
  etherscan: "https://sepolia.etherscan.io/address/0xb452901e6C5231e8c15Feda1294143d48574325B",
} as const;

export const DOC_SECTIONS = [
  { slug: "overview", label: "Overview" },
  { slug: "architecture", label: "Architecture" },
  { slug: "concepts", label: "Core concepts" },
  { slug: "individual-flow", label: "Individual flow" },
  { slug: "public-release", label: "Public tier release" },
  { slug: "company-flow", label: "Company flow" },
  { slug: "privacy", label: "Privacy model" },
  { slug: "trust", label: "Trust & verification" },
  { slug: "explore", label: "Explore & trends" },
  { slug: "faq", label: "FAQ" },
] as const;

export type DocSectionSlug = (typeof DOC_SECTIONS)[number]["slug"];

export function isDocSectionSlug(value: string): value is DocSectionSlug {
  return DOC_SECTIONS.some((section) => section.slug === value);
}

export type DocBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | {
      type: "callout";
      variant: "info" | "warning" | "trust";
      title?: string;
      body: string;
    }
  | { type: "code"; code: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | {
      type: "link";
      before: string;
      href: string;
      label: string;
      after?: string;
      external?: boolean;
    }
  | {
      type: "steps";
      items: { n: string; title: string; body: string; detail?: string }[];
    }
  | {
      type: "concepts";
      items: { icon: IconName; title: string; body: string; bullets?: string[] }[];
    }
  | { type: "faq"; items: { q: string; a: string }[] }
  | { type: "trust-badges"; badges: string[] };

export interface DocPage {
  label: string;
  intro: string;
  blocks: DocBlock[];
}

export interface DocAnchor {
  id: string;
  label: string;
}

/** Stable id for in-page anchor links (sidebar + scroll targets). */
export function slugifyHeading(text: string): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "section";
}

function extractAnchorsFromBlocks(blocks: DocBlock[]): DocAnchor[] {
  const anchors: DocAnchor[] = [];

  for (const block of blocks) {
    if (block.type === "h2") {
      anchors.push({ id: slugifyHeading(block.text), label: block.text });
    } else if (block.type === "concepts") {
      for (const item of block.items) {
        anchors.push({ id: slugifyHeading(item.title), label: item.title });
      }
    } else if (block.type === "steps") {
      for (const item of block.items) {
        anchors.push({ id: slugifyHeading(item.title), label: item.title });
      }
    } else if (block.type === "faq") {
      for (const item of block.items) {
        anchors.push({ id: slugifyHeading(item.q), label: item.q });
      }
    }
  }

  return anchors;
}

export function getPageAnchors(slug: DocSectionSlug): DocAnchor[] {
  const anchors = extractAnchorsFromBlocks(DOC_PAGES[slug].blocks);
  if (slug === "faq") {
    anchors.push({ id: "ready-to-try", label: "Ready to try it?" });
  }
  return anchors;
}

const CATEGORY_COUNT = POSITIONS.length * CITIES.length * SENIORITY_LEVELS.length;

export const DOC_PAGES: Record<DocSectionSlug, DocPage> = {
  overview: {
    label: "Overview",
    intro:
      "ASB (Anonymous Salary Benchmark) lets people and companies compare compensation using fully homomorphic encryption on Ethereum. This page explains what the product does, who it is for, and how it differs from traditional salary surveys.",
    blocks: [
      {
        type: "p",
        text: "ASB is a decentralized benchmark: there is no central database of salaries, no admin who can read submissions, and no backend that stores your number in clear text. You connect a wallet, encrypt your salary in the browser, and interact with a smart contract on Sepolia testnet.",
      },
      {
        type: "h2",
        text: "What problem does it solve?",
      },
      {
        type: "p",
        text: "Traditional salary tools ask you to trust a company with your exact pay. Even when they only show averages, the operator typically holds every raw submission. Leaks, insider access, or subpoenas can expose individuals. ASB removes that operator from the trust path: the chain stores ciphertext handles, and only carefully gated outputs become public.",
      },
      {
        type: "h2",
        text: "Who is it for?",
      },
      {
        type: "ul",
        items: [
          "Individuals who want to know if they are above or below the market for their role, city, and seniority — without publishing their salary.",
          "Companies that want to benchmark internal pay against the live market average for a category — without exposing payroll to a third party.",
          "Researchers and builders exploring FHEVM: tiered public releases, ACL-gated user decryption, and homomorphic aggregation in production-shaped flows.",
        ],
      },
      {
        type: "h2",
        text: "What you get out of it",
      },
      {
        type: "table",
        headers: ["Output", "Who sees it", "When"],
        rows: [
          [
            "Participant count per category",
            "Everyone (on-chain view call)",
            "Always, after first submit",
          ],
          [
            "Public tier average (USD/year)",
            "Everyone",
            "After tier finalize at k=5, 10, 15…",
          ],
          [
            "Private above/below bit",
            "Your wallet only",
            "After k≥5 and compareToAverage",
          ],
          [
            "Company above-market bit",
            "Company wallet only",
            "After 5+ employees in category",
          ],
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "Testnet today",
        body: `ASB currently runs on ${DEPLOYMENT.network} (chain ID ${DEPLOYMENT.chainId}). You need test ETH and a browser wallet. Contract: ${DEPLOYMENT.address.slice(0, 10)}…${DEPLOYMENT.address.slice(-8)}.`,
      },
      {
        type: "link",
        before: "Ready to try it?",
        href: "/app",
        label: "Open the benchmark app",
        after: "or read Architecture next for the full data path.",
      },
    ],
  },

  architecture: {
    label: "Architecture",
    intro:
      "A practical map of how data moves from your browser to the chain, through Zama FHEVM, and back to you as either public tier averages or private comparison results.",
    blocks: [
      {
        type: "h2",
        text: "Stack",
      },
      {
        type: "table",
        headers: ["Layer", "Technology", "Role"],
        rows: [
          ["Frontend", "Next.js 15, wagmi, RainbowKit", "Wallet connect, UI, contract reads"],
          [
            "Encryption",
            "@zama-fhe/relayer-sdk (browser)",
            "euint64 input + proof before submit",
          ],
          ["Chain", "Ethereum Sepolia", "Immutable state, events, verification"],
          ["Contract", "SalaryFHE.sol, FHEVM v0.11", "Homomorphic sum, tiers, ACL"],
          ["Coprocessor", "Zama FHEVM executor", "FHE ops off-chain, handles on-chain"],
          ["Public decrypt", "Relayer + KMS signatures", "Tier average finalize proof"],
        ],
      },
      {
        type: "h2",
        text: "On-chain data model",
      },
      {
        type: "p",
        text: "Each category (position × city × seniority) maps to a Bucket with an encrypted sum, participant count, live encrypted average, and per-tier TierPublish records. Individuals have one submission per wallet; companies maintain separate CompanyBucket aggregates keyed by company address + category.",
      },
      {
        type: "code",
        code: `categoryId = uint256(keccak256(abi.encode(positionId, cityId, seniorityId)))

Bucket {
  encryptedSum      // euint64 — homomorphic sum of salaries
  count             // participant count
  encryptedAverage  // euint64 — sum / count (live pool avg)
  tiers[tier]       // snapshot at k=5,10,15… → public release
}`,
      },
      {
        type: "h2",
        text: "End-to-end: individual submit",
      },
      {
        type: "steps",
        items: [
          {
            n: "1",
            title: "Browser encrypt",
            body: "Relayer SDK creates an externalEuint64 handle and input proof for your USD salary. Plaintext never hits the network.",
            detail: "createEncryptedInput(contract, user) → add64(salary) → encrypt()",
          },
          {
            n: "2",
            title: "submitSalary tx",
            body: "Contract verifies proof via FHE.fromExternal, adds ciphertext to the bucket sum, stores your salary handle, sets hasSubmitted[you] = true.",
            detail: "One wallet → one category → one lifetime submit.",
          },
          {
            n: "3",
            title: "Live average (encrypted)",
            body: "When count ≥ 5, contract computes encryptedAverage = encryptedSum / count. Used for private comparisons — not publicly decrypted.",
          },
          {
            n: "4",
            title: "Tier snapshot",
            body: "At count 5, 10, 15… the current encrypted average is copied into tiers[tier].encryptedSnapshot. This is the frozen cohort average for public release.",
          },
        ],
      },
      {
        type: "h2",
        text: "End-to-end: public tier average",
      },
      {
        type: "steps",
        items: [
          {
            n: "1",
            title: "requestAverageRelease",
            body: "Marks the tier snapshot handle as publicly decryptable (FHE.makePubliclyDecryptable). Emits AverageReleaseRequested with the handle.",
          },
          {
            n: "2",
            title: "Relayer publicDecrypt",
            body: "Off-chain: relayer decrypts the snapshot, returns clear USD average + KMS signature bundle.",
          },
          {
            n: "3",
            title: "finalizeAverage",
            body: "On-chain: FHE.checkSignatures verifies KMS proof, stores clearAverage, sets finalized=true. Emits AverageFinalized(categoryId, tier, avg).",
          },
        ],
      },
      {
        type: "callout",
        variant: "warning",
        title: "Important distinction",
        body: "Public tier averages are historical snapshots at fixed cohort sizes. Private compareToAverage always uses the live encrypted pool average, which changes as new people join.",
      },
      {
        type: "link",
        before: "Verify the deployed contract on",
        href: DEPLOYMENT.etherscan,
        label: "Etherscan",
        after: ".",
        external: true,
      },
    ],
  },

  concepts: {
    label: "Core concepts",
    intro:
      "The ideas behind ASB security and UX. You do not need a cryptography PhD to use the app, but understanding these terms helps you interpret what the UI and on-chain state mean.",
    blocks: [
      {
        type: "concepts",
        items: [
          {
            icon: "shield",
            title: "Fully homomorphic encryption (FHE)",
            body: "FHE allows computation on encrypted data. The SalaryFHE contract never sees your salary in plain text. It stores euint64 handles and requests FHE.add, FHE.div, and FHE.gt through the FHEVM coprocessor. Each operation returns a new handle with its own ACL.",
            bullets: [
              "User input enters via FHE.fromExternal(encSalary, inputProof) — not FHE.asEuint64 for user data.",
              "After every stored computation the contract calls FHE.allowThis so it keeps access next transaction.",
              "Values you must decrypt require FHE.allow(handle, yourAddress) or decryption reverts with SenderNotAllowed.",
            ],
          },
          {
            icon: "users",
            title: "k-anonymity (k = 5)",
            body: `Aggregates and benchmarks stay disabled until at least ${MIN_PARTICIPANTS} participants exist in the same category. With fewer than five submissions, an observer who knows four salaries could solve for the fifth if an average leaked.`,
            bullets: [
              "Participant count is public on-chain (getBucketCount).",
              "encryptedAverage is only computed when count ≥ 5.",
              "Company benchmarks require five employees in the same category bucket.",
            ],
          },
          {
            icon: "tag",
            title: "Categories",
            body: `A category is (positionId, cityId, seniorityId). The contract validates indices against fixed list sizes (${POSITIONS.length} roles, ${CITIES.length} cities, ${SENIORITY_LEVELS.length} seniority bands) and hashes them into a uint256 id. Up to ${CATEGORY_COUNT.toLocaleString()} combinations exist; sparse pools simply wait for participants.`,
            bullets: [
              "List order is the on-chain index — do not reorder deployed lists.",
              "Example: Senior Backend · Istanbul · Senior → unique categoryId.",
              "Explore and /app use the same id via computeCategoryId in the frontend.",
            ],
          },
          {
            icon: "key",
            title: "Access control (ACL)",
            body: "Every ciphertext handle has an ACL: who may use or decrypt it. ASB grants the contract persistent access (allowThis), grants users access to their own salary and comparison results (allow), and uses makePubliclyDecryptable only for tier snapshots during public release.",
            bullets: [
              "Private comparison: only your wallet can user-decrypt the ebool from compareToAverage.",
              "Public tier avg: after finalize, clearAverage is plain uint64 on-chain — intentional transparency at tier boundaries.",
            ],
          },
          {
            icon: "broadcast",
            title: "Public vs user decryption",
            body: "Two different decryption paths serve two different purposes. Mixing them up is a common source of confusion.",
            bullets: [
              "Public: makePubliclyDecryptable → relayer publicDecrypt → finalizeAverage with KMS proof. Everyone trusts the same verified number.",
              "User: EIP-712 signed session → userDecrypt on your comparison handle. Only you learn above/below.",
            ],
          },
          {
            icon: "ban",
            title: "One submission per wallet (individuals)",
            body: "hasSubmitted[address] gates submitSalary. You pick one category at submit time; userCategoryId is stored permanently. This limits pool poisoning by a single actor submitting many times.",
            bullets: [
              "Companies use submitCompanySalary — unlimited employee rows from one wallet.",
              "Switching category after submit is not supported; use a new wallet if you made a mistake on testnet.",
            ],
          },
        ],
      },
    ],
  },

  "individual-flow": {
    label: "Individual flow",
    intro:
      "Step-by-step guide for submitting your salary, watching the pool grow, optionally publishing tier averages, and running a private market comparison.",
    blocks: [
      {
        type: "link",
        before: "Follow along in the",
        href: "/app",
        label: "benchmark app",
        after: "while reading.",
      },
      {
        type: "steps",
        items: [
          {
            n: "01",
            title: "Connect your wallet",
            body: "ASB uses Sepolia. Connect MetaMask or any WalletConnect-compatible wallet via RainbowKit. No signup, email, or off-chain account — your address is your identity to the contract.",
            detail: "Ensure you have Sepolia ETH for gas. FHE transactions are heavier than simple transfers; keep a small buffer.",
          },
          {
            n: "02",
            title: "Pick your category",
            body: `Select position, city, and seniority. These map to uint16 indices and produce categoryId = keccak256(encode(position, city, seniority)). Each category has an isolated encrypted pool.`,
            detail: `You have ${POSITIONS.length} roles, ${CITIES.length} cities, and ${SENIORITY_LEVELS.length} seniority levels to choose from.`,
          },
          {
            n: "03",
            title: "Encrypt and submit",
            body: "Enter annual USD salary. The Relayer SDK encrypts to euint64 locally. submitSalary(position, city, seniority, encSalary, inputProof) sends only ciphertext + proof on-chain.",
            detail: "First visit loads FHE WASM (~5s). Button shows “Preparing encryption…” until SDK is ready. Wallet opens after local encrypt completes.",
          },
          {
            n: "04",
            title: "Track k-anonymity",
            body: `StatsCard shows participants / next tier target. Until count ≥ ${MIN_PARTICIPANTS}, encryptedAverage is not computed and compare is disabled.`,
            detail: "getBucketCount(categoryId) updates after each submit in your category.",
          },
          {
            n: "05",
            title: "Publish tier average (optional, anyone)",
            body: `At 5, 10, 15… participants a snapshot exists. Anyone can run the three-step release: requestAverageRelease → publicDecrypt → finalizeAverage. UI button appears when a tier is pending.`,
            detail: "Each tier publishes once. Published USD values are snapshots, not live rolling averages.",
          },
          {
            n: "06",
            title: "Compare privately",
            body: "After you submitted and the pool has k≥5, call compareToAverage. Contract sets ebool = FHE.gt(yourSalary, encryptedAverage) and grants you ACL. Sign EIP-712, userDecrypt — you see one bit: above or below market.",
            detail: "Nobody else learns your result. The comparison uses the live encrypted average, not the last public tier.",
          },
        ],
      },
      {
        type: "callout",
        variant: "warning",
        title: "Gas and UX notes",
        body: "Submit and compare transactions interact with FHEVM precompiles and are more expensive than ERC-20 transfers. Status toasts in the app show encrypt → submit → confirm phases so you know the wallet delay is expected.",
      },
    ],
  },

  "public-release": {
    label: "Public tier release",
    intro:
      "How a category average becomes a verified public number on-chain — and why ASB uses tier snapshots instead of updating the clear average on every new participant.",
    blocks: [
      {
        type: "h2",
        text: "Why tiers at 5, 10, 15…?",
      },
      {
        type: "p",
        text: "If the clear average updated every time someone joined, an observer could subtract consecutive averages and infer the latest salary (differential attack). Tier snapshots freeze the encrypted average at round boundaries. Each public number represents exactly k participants at publish time.",
      },
      {
        type: "h2",
        text: "When is a snapshot ready?",
      },
      {
        type: "p",
        text: "Inside _addToMarket, when count reaches a multiple of MIN_PARTICIPANTS (5), _snapshotTier copies encryptedAverage into tiers[count].encryptedSnapshot and sets snapshotReady = true. The snapshot reflects the average of all participants at that moment.",
      },
      {
        type: "h2",
        text: "Three-step release (FHEVM public decryption)",
      },
      {
        type: "steps",
        items: [
          {
            n: "1",
            title: "requestAverageRelease(categoryId, tier)",
            body: "Requires bucket.count ≥ tier, snapshotReady, and not already requested. Sets releaseRequested and calls FHE.makePubliclyDecryptable on the snapshot handle.",
            detail: "Event: AverageReleaseRequested(categoryId, tier, averageHandle)",
          },
          {
            n: "2",
            title: "publicDecrypt (off-chain)",
            body: "Frontend calls instance.publicDecrypt([handle]). Relayer returns clearValues[handle] and decryptionProof signed by KMS validators.",
            detail: "This step needs no wallet transaction — relayer HTTP — but must match the handle from step 1.",
          },
          {
            n: "3",
            title: "finalizeAverage(categoryId, tier, clearAverage, proof)",
            body: "Contract runs FHE.checkSignatures on the snapshot handle and encoded clear value. On success stores clearAverage and finalized = true.",
            detail: "Event: AverageFinalized(categoryId, tier, clearAverage). View via getClearAverage(id, tier) and isTierFinalized.",
          },
        ],
      },
      {
        type: "code",
        code: `// Order of handles passed to checkSignatures MUST match publicDecrypt input
bytes32[] cts = [FHE.toBytes32(encryptedSnapshot)];
FHE.checkSignatures(cts, abi.encode(clearAverage), decryptionProof);`,
      },
      {
        type: "callout",
        variant: "trust",
        title: "What “verified average” means",
        body: "The clear USD number is not typed in by a admin. It is the KMS-validated decryption of the on-chain snapshot ciphertext. Anyone can read clearAverage after finalize and cross-check the AverageFinalized event on Etherscan.",
      },
      {
        type: "h2",
        text: "Reading tier state in the UI",
      },
      {
        type: "ul",
        items: [
          "StatsCard: latest finalized tier + clearAverage from getLatestFinalizedTier / getClearAverage.",
          "Explore: tier-5 and tier-10 averages per demo category, merged with live on-chain reads.",
          "Trends view: delta between tier snapshots (e.g. 5 → 10 participants) shows market direction without exposing individuals.",
        ],
      },
    ],
  },

  "company-flow": {
    label: "Company flow",
    intro:
      "How employers aggregate encrypted employee salaries and learn — with one private bit — whether they pay above the live market average for a category.",
    blocks: [
      {
        type: "link",
        before: "Use the",
        href: "/company",
        label: "company benchmark page",
        after: "with a dedicated wallet (recommended: separate from personal submit wallet).",
      },
      {
        type: "steps",
        items: [
          {
            n: "01",
            title: "Connect company wallet",
            body: "Same Sepolia + FHE stack as individuals. There is no separate contract — company flows use submitCompanySalary and computeCompanyComparison on SalaryFHE.",
          },
          {
            n: "02",
            title: "Add employees (encrypted)",
            body: "For each employee pick category + USD salary. submitCompanySalary encrypts locally and increments both the global market bucket and your CompanyBucket keyed by keccak256(company, categoryId).",
            detail: "Each employee row also adds to the public market pool — company data helps everyone’s aggregate.",
          },
          {
            n: "03",
            title: "Reach five in a category",
            body: `getCompanyBucketCount(yourAddress, categoryId) must be ≥ ${MIN_PARTICIPANTS}. Until then computeCompanyComparison reverts CompanyNotEnoughEmployees.`,
          },
          {
            n: "04",
            title: "Benchmark",
            body: "computeCompanyComparison computes encrypted companyAverage = sum / count, then ebool = FHE.gt(companyAverage, market.encryptedAverage). User-decrypt the handle — above market or not.",
            detail: "Market side requires market.averageComputed (global pool already has k≥5).",
          },
        ],
      },
      {
        type: "h2",
        text: "Individual vs company on the same contract",
      },
      {
        type: "table",
        headers: ["", "Individual", "Company"],
        rows: [
          ["Submit function", "submitSalary", "submitCompanySalary"],
          ["Submit limit", "Once per wallet", "Unlimited employees"],
          ["Comparison", "compareToAverage", "computeCompanyComparison"],
          ["Output", "You vs market avg", "Company avg vs market avg"],
          ["Decrypt", "User decrypt (EIP-712)", "User decrypt (EIP-712)"],
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "Privacy expectation",
        body: "Employee rows are encrypted like individual submits. The contract never stores clear salaries. Only your company wallet can decrypt the final above/below bit for your bucket.",
      },
    ],
  },

  privacy: {
    label: "Privacy model",
    intro:
      "What ASB hides, what it reveals on purpose, and what remains visible because of how public blockchains work.",
    blocks: [
      {
        type: "h2",
        text: "Stays private (cryptographic guarantees)",
      },
      {
        type: "ul",
        items: [
          "Your exact salary — only as euint64 ciphertext on-chain; clear value only in your browser before encrypt.",
          "Your compareToAverage result — ebool ACL’d to your address; user decryption requires your signature.",
          "Company employee salaries — aggregated inside encrypted CompanyBucket; no per-employee clear export.",
          "Company benchmark bit — ACL’d to company wallet only.",
        ],
      },
      {
        type: "h2",
        text: "Public by design",
      },
      {
        type: "ul",
        items: [
          "Wallet addresses that submitted (SalarySubmitted events link address ↔ categoryId, not salary).",
          "Participant counts per category (getBucketCount).",
          "Finalized tier averages in USD (clearAverage after KMS-verified finalize).",
          "Transaction metadata: gas, timestamps, block numbers.",
        ],
      },
      {
        type: "h2",
        text: "Pseudonymity vs anonymity",
      },
      {
        type: "p",
        text: "Blockchain activity is pseudonymous: your address is visible, but not your real-world identity unless you link them (e.g. posting your address publicly). ASB does not collect KYC. k-anonymity protects salary inference within a category; it does not hide that you participated.",
      },
      {
        type: "h2",
        text: "Threat model (honest summary)",
      },
      {
        type: "table",
        headers: ["Threat", "Mitigation"],
        rows: [
          [
            "Operator reads raw salaries",
            "No operator DB; ciphertext only on-chain",
          ],
          [
            "Small pool inference",
            `k≥${MIN_PARTICIPANTS} before averages / compare`,
          ],
          [
            "Differential leak on each join",
            "Tier snapshots at fixed k, not rolling clear avg",
          ],
          [
            "Unauthorized decrypt",
            "FHEVM ACL + SenderNotAllowed on violation",
          ],
          [
            "Fake public average",
            "finalizeAverage requires KMS checkSignatures",
          ],
        ],
      },
      {
        type: "callout",
        variant: "warning",
        title: "What ASB does not promise",
        body: "ASB is a testnet demo, not a certified compliance product. Side channels (browser malware, shoulder surfing, wallet linking) are out of scope. Public tier numbers are intentionally clear after finalize.",
      },
    ],
  },

  trust: {
    label: "Trust & verification",
    intro:
      "Why you should trust published averages and the protocol — without trusting a central salary database. This is the “verified” layer: on-chain state, KMS proofs, and public audit paths.",
    blocks: [
      {
        type: "trust-badges",
        badges: [
          "k ≥ 5 before aggregates",
          "On-chain ciphertext only",
          "KMS-signed tier finalize",
          "FHE encrypted inputs",
          "Immutable tier snapshots",
          "Public Etherscan audit",
        ],
      },
      {
        type: "h2",
        text: "How to verify a published tier average",
      },
      {
        type: "steps",
        items: [
          {
            n: "1",
            title: "Check participant count",
            body: `Call getBucketCount(categoryId) on Sepolia — count should be ≥ tier (e.g. 10 for tier-10 avg).`,
          },
          {
            n: "2",
            title: "Confirm tier finalized",
            body: "isTierFinalized(categoryId, tier) returns true. getClearAverage returns the USD/year uint64 stored after proof verification.",
          },
          {
            n: "3",
            title: "Audit the event log",
            body: "On Etherscan, filter AverageFinalized events for your categoryId and tier. The clearAverage in the event must match the UI.",
            detail: `Contract: ${DEPLOYMENT.address}`,
          },
          {
            n: "4",
            title: "Trace release transactions",
            body: "AverageReleaseRequested proves which ciphertext handle was marked public. finalizeAverage tx includes the KMS proof verification — not a human-entered number.",
          },
        ],
      },
      {
        type: "link",
        before: "Open the contract on",
        href: DEPLOYMENT.etherscan,
        label: "Sepolia Etherscan",
        after: "→ Contract → Events → AverageFinalized.",
        external: true,
      },
      {
        type: "h2",
        text: "Why this is not “random Excel”",
      },
      {
        type: "ul",
        items: [
          "Submissions are transactions — reproducible, timestamped, non-repudiable.",
          "Tier averages come from encrypted snapshots taken by contract logic at k boundaries, not spreadsheet formulas.",
          "KMS signature check on finalize ties the clear number to a specific ciphertext handle.",
          "Private comparisons never expose clear salaries — only ACL-gated bits.",
          "No admin key can “edit” the pool sum without a visible on-chain tx.",
        ],
      },
      {
        type: "callout",
        variant: "trust",
        title: "Glassdoor vs ASB",
        body: "Traditional sites ask you to trust their database and self-reported data. ASB asks you to trust cryptography + Ethereum: verify counts and finalized events yourself, and treat tier averages as KMS-backed snapshots of on-chain ciphertext.",
      },
    ],
  },

  explore: {
    label: "Explore & trends",
    intro:
      "How Explore merges seed demo pools with on-chain event discovery and live Sepolia reads for pool health and tier trends.",
    blocks: [
      {
        type: "link",
        before: "Browse live pools on",
        href: "/explore",
        label: "Explore",
        after: ".",
      },
      {
        type: "h2",
        text: "Three data sources",
      },
      {
        type: "table",
        headers: ["Source", "Provides", "When used"],
        rows: [
          [
            "seed-manifest.json",
            "Curated demo categories, labels, fallback tier avgs",
            "Always shown (even at 0 participants)",
          ],
          [
            "SalarySubmitted / CompanySalarySubmitted logs",
            "Any categoryId with on-chain activity",
            "Merged into Explore when participants > 0",
          ],
          [
            "Live contract reads",
            "getBucketCount, isTierFinalized, getClearAverage",
            "Overrides manifest when RPC connected",
          ],
        ],
      },
      {
        type: "h2",
        text: "Pools view",
      },
      {
        type: "ul",
        items: [
          "Live badge when participants ≥ 5 (k-anonymity threshold met).",
          "Participant count and fill bar on every pool card.",
          "Published tier averages when tier-5 or tier-10 is finalized on-chain.",
        ],
      },
      {
        type: "h2",
        text: "Trends view",
      },
      {
        type: "p",
        text: "When both tier-5 and tier-10 averages are finalized, Explore computes delta USD and % between snapshots. Sorted by largest change — useful for spotting direction (e.g. pool grew from $74k avg at 5 people to $89k at 10).",
      },
      {
        type: "callout",
        variant: "info",
        title: "Event sync",
        body: "Explore refetches SalarySubmitted and CompanySalarySubmitted logs about every 60 seconds. New categories appear automatically once someone submits — no manifest update required.",
      },
    ],
  },

  faq: {
    label: "FAQ",
    intro: "Common questions about submissions, privacy, tiers, and tooling.",
    blocks: [
      {
        type: "faq",
        items: [
          {
            q: "Can ASB or the contract owner see my salary?",
            a: "No clear salary is stored. The contract holds euint64 handles. There is no owner backdoor decrypt in SalaryFHE. Anyone with ACL permission could in theory use handles they are allowed — individuals only grant themselves their salary and comparison handles.",
          },
          {
            q: "Can I submit to two categories with one wallet?",
            a: "No. hasSubmitted is per address, not per category. Second submitSalary reverts AlreadySubmitted. Use a different wallet if you need another category on testnet.",
          },
          {
            q: "Why tier snapshots at 5, 10, 15 instead of updating every participant?",
            a: "Publishing a new clear average on every join would leak information about the latest salary through difference attacks. Tier snapshots freeze averages at known cohort sizes.",
          },
          {
            q: "Is my private comparison based on the public tier average or the live pool?",
            a: "Always the live encrypted pool average (encryptedAverage), which updates as people join. Public tier numbers are historical transparency artifacts; they do not drive compareToAverage.",
          },
          {
            q: "What chain and tools does ASB use?",
            a: "Sepolia testnet, Solidity + Zama FHEVM v0.11, Next.js frontend, wagmi + RainbowKit, @zama-fhe/relayer-sdk for browser encrypt/decrypt. Contract inherits ZamaEthereumConfig.",
          },
          {
            q: "What if my category never reaches five people?",
            a: "You can still submit — your ciphertext joins the pool — but encryptedAverage, compare, and public release stay locked until k≥5. Share the app with peers in the same role/city band.",
          },
          {
            q: "Why does submit take several seconds before MetaMask opens?",
            a: "Salary must be encrypted locally (FHE WASM) before the transaction. First page load also initializes the SDK. The app shows “Preparing encryption…” during this — it is not a broken button.",
          },
          {
            q: "Is this production-ready for real payroll?",
            a: "ASB is a Sepolia demonstration of FHEVM patterns. Testnet ETH, testnet security assumptions, and unaudited demo scope — do not treat it as HR or legal compensation advice.",
          },
          {
            q: "How do I verify a number on Explore?",
            a: "Match getClearAverage and AverageFinalized on Etherscan for the categoryId. See Trust & verification for the full checklist.",
          },
        ],
      },
    ],
  },
};

/* Legacy exports kept for any external imports */
export const INDIVIDUAL_STEPS =
  DOC_PAGES["individual-flow"].blocks.find((b) => b.type === "steps")?.type === "steps"
    ? (DOC_PAGES["individual-flow"].blocks.find((b) => b.type === "steps") as Extract<
        DocBlock,
        { type: "steps" }
      >).items.map((s) => ({ n: s.n, title: s.title, body: s.body }))
    : [];

export const COMPANY_STEPS =
  DOC_PAGES["company-flow"].blocks.find((b) => b.type === "steps")?.type === "steps"
    ? (DOC_PAGES["company-flow"].blocks.find((b) => b.type === "steps") as Extract<
        DocBlock,
        { type: "steps" }
      >).items.map((s) => ({ n: s.n, title: s.title, body: s.body }))
    : [];

export const CONCEPTS =
  DOC_PAGES.concepts.blocks.find((b) => b.type === "concepts")?.type === "concepts"
    ? (DOC_PAGES.concepts.blocks.find((b) => b.type === "concepts") as Extract<
        DocBlock,
        { type: "concepts" }
      >).items.map(({ icon, title, body }) => ({ icon, title, body }))
    : [];

export const FAQ =
  DOC_PAGES.faq.blocks.find((b) => b.type === "faq")?.type === "faq"
    ? (DOC_PAGES.faq.blocks.find((b) => b.type === "faq") as Extract<DocBlock, { type: "faq" }>)
        .items
    : [];

export const PUBLIC_RELEASE_STEPS =
  DOC_PAGES["public-release"].blocks.find((b) => b.type === "steps")?.type === "steps"
    ? (DOC_PAGES["public-release"].blocks.find((b) => b.type === "steps") as Extract<
        DocBlock,
        { type: "steps" }
      >).items.map((s) => ({ step: s.n, title: s.title, body: s.body }))
    : [];

export const PRIVACY_ITEMS = [
  "Your exact salary is encrypted end-to-end and never stored in clear text.",
  "Your personal comparison result is user-decryptable only by your wallet.",
  "Company salary entries are aggregated in encrypted company buckets.",
  "Company benchmark output is only visible to the company wallet.",
];
