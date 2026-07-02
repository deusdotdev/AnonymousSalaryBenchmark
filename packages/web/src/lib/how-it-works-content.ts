import { CITIES, MIN_PARTICIPANTS, POSITIONS, SENIORITY_LEVELS } from "@/lib/categories";

export const DOC_SECTIONS = [
  { slug: "overview", label: "Overview" },
  { slug: "concepts", label: "Core concepts" },
  { slug: "individual-flow", label: "Individual flow" },
  { slug: "public-release", label: "Public average release" },
  { slug: "company-flow", label: "Company flow" },
  { slug: "privacy", label: "Privacy model" },
  { slug: "faq", label: "FAQ" },
] as const;

export type DocSectionSlug = (typeof DOC_SECTIONS)[number]["slug"];

export function isDocSectionSlug(value: string): value is DocSectionSlug {
  return DOC_SECTIONS.some((section) => section.slug === value);
}

export const INDIVIDUAL_STEPS = [
  {
    n: "01",
    title: "Connect your wallet",
    body: "ASB runs on Ethereum Sepolia. Connect any compatible wallet (MetaMask, WalletConnect, etc.). No account signup, no email, no off-chain database. Your wallet address is the only identity the contract sees.",
  },
  {
    n: "02",
    title: "Pick your category",
    body: `Choose one of ${POSITIONS.length} roles, ${CITIES.length} cities, and ${SENIORITY_LEVELS.length} seniority bands. These three dimensions define a category — for example "Senior Backend Engineer in Istanbul". Each category has its own encrypted pool and its own market average.`,
  },
  {
    n: "03",
    title: "Encrypt and submit",
    body: "Enter your annual salary in USD. The Zama Relayer SDK encrypts it in your browser as a euint64 ciphertext before anything leaves your device. The encrypted handle and a zero-knowledge input proof are sent to the smart contract. The contract homomorphically adds your salary to the category sum. Your clear-text number never appears on-chain.",
  },
  {
    n: "04",
    title: "Wait for k-anonymity",
    body: `Category statistics stay locked until at least ${MIN_PARTICIPANTS} people join the same category. This k-anonymity threshold prevents anyone from inferring your salary from a small pool. You can track participant count in real time on the app dashboard.`,
  },
  {
    n: "05",
    title: "Release the public average (optional)",
    body: `Once a tier boundary is reached (${MIN_PARTICIPANTS}, 10, 15, … participants), anyone can trigger a three-step public release: (1) mark the tier snapshot for public decryption on-chain, (2) the relayer decrypts the snapshot off-chain, (3) finalize with a KMS signature proof. Each tier publishes exactly once — a historical snapshot, not a live leak.`,
  },
  {
    n: "06",
    title: "Compare privately",
    body: "After the live encrypted average exists, call compareToAverage. The contract homomorphically evaluates FHE.gt(yourSalary, poolAverage) and grants you ACL access to the result. You user-decrypt a single bit: above the market average or not. Nobody else learns your outcome.",
  },
];

export const COMPANY_STEPS = [
  {
    n: "01",
    title: "Connect a company wallet",
    body: "Use a dedicated wallet for payroll benchmarking. There is no limit on how many encrypted employee salaries you can submit.",
  },
  {
    n: "02",
    title: "Add employees by category",
    body: "For each employee, select role, city, seniority, and salary. Each entry is encrypted locally and added to both the global market pool and your company bucket for that category.",
  },
  {
    n: "03",
    title: "Reach five employees",
    body: `Your company bucket needs at least ${MIN_PARTICIPANTS} encrypted entries in the same category before benchmarking unlocks — mirroring the individual k-anonymity rule.`,
  },
  {
    n: "04",
    title: "Benchmark against the market",
    body: "The contract computes your encrypted company average, compares it homomorphically to the live market average, and returns one private bit: you pay above market or at/below. Only your wallet can decrypt it.",
  },
];

export const CONCEPTS = [
  {
    icon: "\u{1F512}",
    title: "Fully homomorphic encryption (FHE)",
    body: "FHE lets the smart contract add, divide, and compare encrypted numbers without ever decrypting them. Zama FHEVM runs these operations via an off-chain coprocessor; results come back as new ciphertext handles with strict access control.",
  },
  {
    icon: "\u{1F465}",
    title: "k-anonymity",
    body: `Averages and benchmarks require at least k=${MIN_PARTICIPANTS} participants in a category. With fewer submissions, no aggregate is exposed — protecting against reverse-engineering individual salaries from small samples.`,
  },
  {
    icon: "\u{1F3F7}",
    title: "Categories",
    body: `Every combination of position × city × seniority is a separate pool (${POSITIONS.length} × ${CITIES.length} × ${SENIORITY_LEVELS.length} possible categories). Sparse categories simply wait for more participants.`,
  },
  {
    icon: "\u{1F510}",
    title: "Access control (ACL)",
    body: "Every ciphertext handle has an ACL listing who may use or decrypt it. The contract calls FHE.allow for values you need to decrypt. Without ACL permission, decryption reverts — even if you know the handle.",
  },
  {
    icon: "\u{1F4E1}",
    title: "Public vs user decryption",
    body: "Tier averages use public decryption (makePubliclyDecryptable → relayer → checkSignatures) so everyone sees the same verified number. Personal comparisons use user decryption — only your wallet holds the key to your result.",
  },
  {
    icon: "\u{26D4}",
    title: "One submission per wallet",
    body: "Individuals can submit exactly once per wallet address. This prevents one person from skewing a category. Companies can submit unlimited employee entries from the same wallet.",
  },
];

export const FAQ = [
  {
    q: "Can ASB or the contract owner see my salary?",
    a: "No. Your salary is encrypted in your browser before submission. The on-chain contract only ever stores ciphertext handles. There is no backend server and no admin decrypt path for individual salaries.",
  },
  {
    q: "Why tier snapshots at 5, 10, 15 instead of updating every new participant?",
    a: "Publishing a new clear average every time someone joins would leak information about the latest submitter's salary through differential analysis. Tier snapshots freeze the average at round boundaries so each public number represents a fixed cohort size.",
  },
  {
    q: "Is the private comparison based on the public tier average or the live pool?",
    a: "Private comparisons always use the live encrypted pool average, which updates as new people join. Public tier averages are historical snapshots for transparency; they do not drive your personal above/below result.",
  },
  {
    q: "What chain and tools does ASB use?",
    a: "Sepolia testnet, Solidity + Zama FHEVM v0.11, Next.js frontend, wagmi + RainbowKit for wallets, and @zama-fhe/relayer-sdk for browser-side encryption and decryption.",
  },
  {
    q: "What if my category never reaches five people?",
    a: "You can still submit — your encrypted salary joins the pool — but averages, public releases, and comparisons stay locked until the k-anonymity threshold is met. Consider sharing the app with colleagues in the same role and city.",
  },
];

export const PUBLIC_RELEASE_STEPS = [
  {
    step: "1",
    title: "On-chain request",
    body: "Call requestAverageRelease(categoryId, tier). The tier snapshot is marked as publicly decryptable.",
  },
  {
    step: "2",
    title: "Off-chain decrypt",
    body: "The relayer decrypts the snapshot handle and returns clear value plus KMS signatures.",
  },
  {
    step: "3",
    title: "On-chain finalize",
    body: "finalizeAverage verifies signatures with FHE.checkSignatures and stores the verified clear average.",
  },
];

export const PRIVACY_ITEMS = [
  "Your exact salary is encrypted end-to-end and never stored in clear text.",
  "Your personal comparison result is user-decryptable only by your wallet.",
  "Company salary entries are aggregated in encrypted company buckets.",
  "Company benchmark output is only visible to the company wallet.",
];
