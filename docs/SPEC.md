# Sift — realtime web search

A full-stack search engine. Type, and Google results arrive as you type. Spring Boot proxies the Serper API, React renders it.

**Name:** Sift · **Tagline:** "Google, straight through." · **Package:** `dev.sift.search`

---

## 0. Rules for this build

- **Budget: 30 minutes.** Build in the order in §9. Never refactor ahead of the checklist.
- **Do not ask me questions.** Every decision is already made below. Pick the option written here.
- Write whole files in one pass. No placeholder comments, no `// TODO`, no lorem ipsum.
- The Serper key lives **only** on the server. It must never appear in any file under `frontend/`.
- If a Serper block (`answerBox`, `knowledgeGraph`) is missing, render nothing — never crash, never show "N/A".
- Every string a user reads is written by you as real copy. No "Something went wrong."
- Ship working over ship complete. If time runs out, an app with web search only, that looks finished, beats four broken tabs.

---

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Backend | Java 21, Spring Boot 3.3.x, Maven | `RestClient` is built in, no WebFlux needed |
| HTTP client | `RestClient` (spring-web) | Simplest sync client, zero extra deps |
| Cache | Caffeine via `spring-boot-starter-cache` | Serper free tier is 2,500 credits — cache hard |
| Frontend | React 18 + Vite, **plain JavaScript (.jsx)** | No TS setup cost in a 30-min build |
| Styling | One hand-written `index.css` with CSS custom properties | No Tailwind install/version risk; full control of the look |
| Icons | Inline SVG in a single `Icon.jsx` | No icon package |
| Deploy | Vite builds into Spring's `static/` → one runnable JAR | One artifact, one port, one host |

Maven dependencies, exactly these:
`spring-boot-starter-web`, `spring-boot-starter-validation`, `spring-boot-starter-cache`, `com.github.ben-manes.caffeine:caffeine`, `spring-boot-starter-test`.

---

## 2. Architecture

```
Browser
  │  GET /api/search?q=kanchipuram+silk&type=web&page=1
  ▼
Spring Boot :8080
  ├─ SearchController   validate → SearchService
  ├─ SearchService      @Cacheable(5 min) → SerperClient
  ├─ SerperClient       POST https://google.serper.dev/{type}   X-API-KEY
  └─ maps Serper JSON → our own flat DTOs (frontend never sees Serper's shape)
```

One origin in production. In dev, Vite proxies `/api` to `:8080`.

---

## 3. Serper contract (verified — implement exactly this)

**Request:** `POST https://google.serper.dev/search` (also `/images`, `/news`, `/videos`)

Headers: `X-API-KEY: <key>`, `Content-Type: application/json`
Body: `{"q": "...", "gl": "in", "hl": "en", "num": 10, "page": 1}`

> It is a **POST with a JSON body**, not a GET with query params. Getting this wrong is the #1 failure here.

**Response fields we use** (all optional except `organic`, guard every read):

- `organic[]` → `title`, `link`, `snippet`, `position`, `date?`, `sitelinks?[{title,link}]`
- `answerBox?` → `answer?`, `snippet?`, `title?`, `link?`
- `knowledgeGraph?` → `title`, `type?`, `description?`, `imageUrl?`, `attributes?{}`
- `peopleAlsoAsk?[]` → `question`, `snippet`, `link`
- `relatedSearches?[]` → `query`
- `images[]` → `title`, `imageUrl`, `thumbnailUrl`, `source`, `link`
- `news[]` → `title`, `link`, `snippet`, `date`, `source`, `imageUrl?`
- `videos[]` → `title`, `link`, `snippet?`, `imageUrl?`, `duration?`, `channel?`, `date?`

**Errors:** `401/403` = bad or missing key. `429`/billing error = out of credits. Map both to clean messages (§5.4).

Key comes from env var `SERPER_API_KEY`. `application.yml`:

```yaml
serper:
  api-key: ${SERPER_API_KEY}
  base-url: https://google.serper.dev
  country: in
  language: en
spring:
  cache:
    cache-names: search
    caffeine:
      spec: maximumSize=500,expireAfterWrite=5m
```

---

## 4. Backend files

```
backend/
├── pom.xml
└── src/main/
    ├── java/dev/sift/search/
    │   ├── SiftApplication.java          @SpringBootApplication @EnableCaching
    │   ├── config/RestClientConfig.java   RestClient bean, 8s timeout, base URL + key header
    │   ├── config/WebConfig.java          CORS: allow http://localhost:5173 on /api/**
    │   ├── web/SearchController.java
    │   ├── web/ApiExceptionHandler.java   @RestControllerAdvice
    │   ├── service/SearchService.java     @Cacheable("search") key = type+q+page
    │   ├── client/SerperClient.java       one method per endpoint
    │   ├── client/SerperException.java
    │   └── dto/                           Java records only
    └── resources/application.yml
```

### 4.1 Endpoints

```
GET /api/search?q={string}&type={web|images|news|videos}&page={int}
    q: required, trimmed, 1..256 chars → 400 with a message if blank
    type: default "web"; unknown value → 400
    page: default 1, clamp 1..10

GET /api/health → {"status":"up"}
```

### 4.2 Response DTO (records, this exact shape)

```java
record SearchResponse(
    String query, String type, int page,
    long tookMs, boolean cached,
    AnswerBox answerBox,            // nullable
    Knowledge knowledge,            // nullable
    List<WebResult> results,        // never null, may be empty
    List<ImageResult> images,
    List<NewsResult> news,
    List<VideoResult> videos,
    List<Question> questions,
    List<String> relatedSearches
) {}

record WebResult(int position, String title, String link, String displayLink,
                 String snippet, String date, List<Sitelink> sitelinks) {}
record Sitelink(String title, String link) {}
record AnswerBox(String title, String answer, String snippet, String link) {}
record Knowledge(String title, String type, String description, String imageUrl,
                 Map<String,String> attributes) {}
record ImageResult(String title, String thumbnailUrl, String imageUrl, String source, String link) {}
record NewsResult(String title, String link, String snippet, String date, String source, String imageUrl) {}
record VideoResult(String title, String link, String snippet, String imageUrl, String duration, String channel) {}
record Question(String question, String snippet, String link) {}
record ApiError(String message, String hint, int status) {}
```

`displayLink`: derive from `link` — host with a leading `www.` stripped. Compute it server-side.
`tookMs`: measure around the Serper call. `cached`: `true` when the cache served it.

### 4.3 Parsing

Deserialize Serper's JSON into `JsonNode` (Jackson) and map by hand into the DTOs. Faster to write than mirror-classes for every optional block, and immune to Serper adding fields. Use a small helper `text(node, "field")` that returns `null` for missing.

### 4.4 Errors → user-facing copy

| Cause | HTTP | `message` | `hint` |
|---|---|---|---|
| blank `q` | 400 | Enter something to search for. | — |
| bad `type` | 400 | That search tab doesn't exist. | Use web, images, news or videos. |
| Serper 401/403 | 502 | Sift can't reach the search index. | The SERPER_API_KEY on the server is missing or invalid. |
| Serper 429/credits | 502 | Sift is out of search credits for now. | Try again later, or top up the Serper account. |
| timeout / IO | 504 | The search took too long to come back. | Try that query again. |

---

## 5. Frontend files

```
frontend/
├── index.html            fonts + <title>Sift</title>
├── vite.config.js        proxy /api → localhost:8080; build.outDir → backend static
├── src/
│   ├── main.jsx
│   ├── App.jsx           all state lives here
│   ├── api.js            searchApi(q, type, page, signal)
│   ├── index.css         the whole design system (§6)
│   └── components/
│       ├── SearchBar.jsx
│       ├── Tabs.jsx
│       ├── StatusLine.jsx     result count · latency · cached badge
│       ├── AnswerCard.jsx
│       ├── KnowledgePanel.jsx
│       ├── ResultList.jsx     + ResultItem
│       ├── ImageGrid.jsx
│       ├── NewsList.jsx
│       ├── VideoList.jsx
│       ├── RelatedSearches.jsx
│       ├── Skeleton.jsx
│       ├── EmptyState.jsx
│       └── Icon.jsx
```

### 5.1 Behaviour — this is what makes it "realtime"

- **Debounce 350 ms** after the last keystroke, then fire. Minimum 2 characters.
- **`AbortController`**: abort the in-flight request on every new keystroke. Late responses must never overwrite newer ones.
- **Keep the old results on screen while loading** — dim them to 55% opacity and run a 2px indeterminate progress hairline under the search bar. No full-page spinner after the first search; that flash is what makes apps feel cheap.
- **Skeletons only on the very first search** of a session.
- **URL is state:** push `?q=...&type=...` with `history.replaceState`. Reload and share both work. Read it on mount.
- **Tab switch re-searches** the current query immediately (no debounce).
- Show `tookMs` next to the result count. Show a small `cached` chip when the response was cached — it's honest, and it explains why the second search is instant.
- **Keyboard:** `/` focuses the input from anywhere; `Esc` clears it; `Enter` forces an immediate search.
- Every result title is an `<a target="_blank" rel="noopener noreferrer">`.

### 5.2 States, all four required

1. **Idle** — before any query. See §6.5.
2. **Loading** — hairline + dimmed previous results, or skeletons on first run.
3. **Empty** — "No results for *query*." + "Check the spelling, or try fewer words."
4. **Error** — the `message` from the API in ink, the `hint` beneath in muted, and a "Try again" button that refires.

---

## 6. Design system — build this exactly

The look: **an instrument, not a landing page.** Calm cool paper, one saturated signal colour used sparingly, generous line-height, and monospace only for machine facts (rank number, domain, latency). Restraint everywhere except the signature.

### 6.1 Tokens — put these in `:root`

```css
--canvas:    #F2F3F6;   /* cool paper page background */
--surface:   #FFFFFF;   /* cards, search bar */
--ink:       #101319;   /* primary text */
--ink-soft:  #565D6E;   /* snippets, secondary */
--ink-faint: #8A91A0;   /* meta, captions */
--line:      #E1E4EB;   /* hairlines, borders */
--signal:    #2743F5;   /* electric cobalt — links, focus, active tab */
--signal-dim:#E8EBFF;   /* tint for chips + hover */
--visited:   #6B4FD8;

--r-sm: 6px;  --r-md: 10px;  --r-lg: 16px;
--sp: 4px;                       /* multiply: 4 8 12 16 24 32 48 64 */
--shadow: 0 1px 2px rgba(16,19,25,.04), 0 8px 24px -12px rgba(16,19,25,.12);
--ease: cubic-bezier(.2,.7,.3,1);
```

**Never** use pure black, never a purple gradient, never a glassmorphism blur, never an emoji as an icon.

### 6.2 Type

Load from Google Fonts in `index.html` (one `<link>`, `display=swap`):

- **Instrument Sans** — display: the wordmark, tab labels, result titles. 500/600.
- **Inter** — body: snippets, panels, buttons. 400/500.
- **IBM Plex Mono** — utility only: rank number, domain, `tookMs`, the `cached` chip. 400/500, `letter-spacing: .02em`, uppercase for the chip.

Scale: `12 / 13 / 15 / 17 / 20 / 32 / 44`px.
Result title `17px/1.35` weight 500. Snippet `15px/1.62` in `--ink-soft` — line-height is what separates a real search page from a cramped one. Max text measure `640px`.

### 6.3 Signature element — the query gauge

Under the search bar, a full-width 2px rail in `--line`. While a request is in flight, a `--signal` segment sweeps across it (1.1s loop, `--ease`). When results land, the sweep resolves left-to-right into a settled bar that holds for 400 ms then fades, and the latency prints in mono at its right end (`142 ms`). This is the one animated moment in the app — it makes the speed of the thing visible, which is the entire point of the product. Nothing else in the UI animates beyond 120 ms hovers.

Respect `@media (prefers-reduced-motion: reduce)`: no sweep, just a static bar and the number.

### 6.4 Layout

- Page max-width `1120px`, centred, `24px` side padding.
- Header: wordmark left, search bar centred-left, sticky at top with `--surface` background and a bottom hairline once scrolled.
- Search bar: `--surface`, 1px `--line`, `--r-lg`, `52px` tall, `17px` text, magnifier icon left in `--ink-faint`, clear button right (only when there's text). On focus: border becomes `--signal`, plus `box-shadow: 0 0 0 3px var(--signal-dim)`. **Never remove the focus ring.**
- Tabs: text buttons, `13px` Instrument Sans, `--ink-faint` inactive / `--ink` active, with a 2px `--signal` underline on the active one. No pills, no boxes.
- Results column `640px`; knowledge panel `320px` on the right, stacking **above** the results below `900px`.
- Result item: no card, no border, no shadow. Rank number in mono `--ink-faint` in a `28px` gutter on the left. Then domain in mono `12px`, then title, then snippet. `28px` gap between items. Whole item gets `--signal-dim` background with `-12px` inset padding on hover.
- Images: CSS columns masonry, 4 cols → 2 on mobile, `--r-md` corners, `aspect-ratio` preserved, `loading="lazy"`.
- Answer box: `--surface`, `--r-lg`, `--shadow`, and a 3px `--signal` left edge. The answer at `20px`, the source link beneath in mono `12px`.

### 6.5 Idle screen

Centred, at ~35% viewport height: the wordmark **Sift** at `44px` Instrument Sans 600, letter-spacing `-.02em`; beneath it in `15px` `--ink-soft`: "Type to search. Results arrive as you go." Then the search bar. Then a single row of three example queries as mono chips (`--signal-dim` background) that run the search when clicked — pick real ones: `chennai metro phase 2`, `spring boot 3.3 release notes`, `who won today`. Nothing else. No feature grid, no footer marketing.

### 6.6 Quality floor

Responsive to 360px · visible keyboard focus on every interactive element · `aria-live="polite"` on the status line · `<label class="sr-only">` on the input · colour contrast ≥ 4.5:1 for all text.

---

## 7. Copy rules

Sentence case everywhere. Buttons say what happens: "Try again", not "Submit". Errors state the fact and the fix, and never apologise. The empty state names the query back to the user. No exclamation marks anywhere in the UI.

---

## 8. Commands

```bash
# dev, two terminals
cd backend  && SERPER_API_KEY=xxx ./mvnw spring-boot:run     # :8080
cd frontend && npm install && npm run dev                    # :5173

# production, one artifact
cd frontend && npm run build        # → backend/src/main/resources/static
cd backend  && ./mvnw clean package # → target/sift-1.0.0.jar
SERPER_API_KEY=xxx java -jar target/sift-1.0.0.jar           # :8080 serves everything
```

---

## 9. Build order — follow this exactly

**0–4 min · Scaffold**
- [ ] `backend/` via Maven with the deps in §1; `SiftApplication`; `application.yml`
- [ ] `frontend/` via `npm create vite@latest frontend -- --template react`
- [ ] `vite.config.js`: `server.proxy['/api'] → http://localhost:8080`, `build.outDir: '../backend/src/main/resources/static'`, `emptyOutDir: true`
- [ ] `.gitignore` + `.env.example` with `SERPER_API_KEY=`

**4–12 min · Backend end to end**
- [ ] `RestClientConfig`, `SerperClient` (POST + `X-API-KEY`, all four endpoints)
- [ ] DTO records, JsonNode mapping, `displayLink`
- [ ] `SearchService` with `@Cacheable`, timing, `cached` flag
- [ ] `SearchController` + `ApiExceptionHandler` + CORS
- [ ] **Verify:** `curl 'localhost:8080/api/search?q=test'` returns 10 results before writing any React

**12–22 min · Frontend + design system**
- [ ] `index.css` — every token in §6, written before any component
- [ ] `api.js`, `App.jsx` with debounce + AbortController + URL sync
- [ ] `SearchBar`, `Tabs`, `StatusLine` (with the query gauge), `ResultList`
- [ ] `AnswerCard`, `KnowledgePanel`, `RelatedSearches`
- [ ] `ImageGrid`, `NewsList`, `VideoList`

**22–27 min · States and polish**
- [ ] Idle, loading, empty, error screens
- [ ] `/` and `Esc` shortcuts; mobile down to 360px; reduced-motion
- [ ] `README.md`: one screenshot slot, setup in four commands, deploy in three

**27–30 min · Ship**
- [ ] `npm run build` → `mvnw package` → run the JAR, confirm the whole app at `:8080`
- [ ] `Dockerfile` (§10) and commit

---

## 10. Deploy

Multi-stage `Dockerfile` at repo root:

1. `node:20-alpine` → build `frontend/` into the backend's `static/`
2. `maven:3.9-eclipse-temurin-21` → `mvn -q clean package -DskipTests`
3. `eclipse-temurin:21-jre-alpine` → copy the JAR, `EXPOSE 8080`, `ENTRYPOINT java -jar /app/app.jar`

Add `server.port: ${PORT:8080}` to `application.yml` so Render, Railway and Fly all bind correctly. The only environment variable to set on the host is `SERPER_API_KEY`. Put those two lines in the README.

---

## 11. Definition of done

Typing `kanchipuram silk sarees` shows results before you finish the word. The second identical search returns in under 10 ms with a `cached` chip. All four tabs return data. Killing the API key produces the styled error card, not a stack trace. `java -jar` alone serves the finished app on one port. Nothing on screen looks like a bootstrap template.

## 12. Do not

Bootstrap or Material UI · Tailwind · Redux · Lombok · a database · user accounts · a `/search` React route · the API key anywhere in `frontend/` · gradients · emoji icons · `console.log` in committed code · a spinner that replaces existing results.