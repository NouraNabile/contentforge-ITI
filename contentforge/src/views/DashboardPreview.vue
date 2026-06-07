<!-- Dashboard Preview -->
<template>
  <AppLayout>
    <div class="flex flex-col h-full">
      <!-- Page toolbar -->
      <div
        class="px-6 py-4 border-b flex items-center justify-between sticky top-0 z-10 theme-glass"
        style="border-color: var(--border)"
      >
        <div>
          <h1 class="font-display text-lg font-600 theme-text">
            {{ t("dashboard.title") }}
          </h1>
          <p class="text-xs theme-sub mt-0.5">
            <template v-if="currentCalendar">
              {{ calendarDateRange }} · {{ store.posts?.length || 0 }}
              {{ t("dashboard.postsPlanned") }}
            </template>
            <template v-else>{{ t("dashboard.noCalendar") }}</template>
          </p>
        </div>
        <div class="flex items-center gap-2">
          <!-- Top trend badge -->
          <span
            v-if="topTrend"
            class="text-[11px] px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-default"
            :title="`${t('dashboard.trending')} ${topTrend.change}`"
          >
            ✦ {{ topTrend.tag }}
          </span>

          <!-- Calendar actions -->
          <template v-if="currentCalendar">
            <!-- Approve Plan -->
            <button
              @click="approvePlan"
              :disabled="approving || planApproved"
              class="group px-2.5 py-2 rounded-xl bg-green-600 text-white hover:bg-green-500 transition-all duration-200 disabled:opacity-50 flex items-center overflow-hidden"
            >
              <svg
                class="w-3.5 h-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span
                class="max-w-0 group-hover:max-w-[7rem] overflow-hidden transition-all duration-200 whitespace-nowrap text-xs font-medium group-hover:ml-1.5"
              >
                {{
                  approving
                    ? t("dashboard.approving")
                    : t("dashboard.approvePlan")
                }}
              </span>
            </button>

            <div class="w-px h-5 bg-white/10 mx-1"></div>

            <!-- Reset Calendar -->
            <button
              @click="confirmReset"
              class="group px-2.5 py-2 rounded-xl border border-zinc-600/50 text-zinc-400 hover:bg-zinc-700/40 transition-all duration-200 flex items-center overflow-hidden"
            >
              <svg
                class="w-3.5 h-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 3v5h5"
                />
              </svg>
              <span
                class="max-w-0 group-hover:max-w-[8rem] overflow-hidden transition-all duration-200 whitespace-nowrap text-xs font-medium group-hover:ml-1.5"
              >
                {{ t("dashboard.resetCalendar") }}
              </span>
            </button>

            <div class="w-px h-5 bg-white/10 mx-1"></div>

            <!-- Delete -->
            <button
              @click="confirmDelete"
              class="group px-2.5 py-2 rounded-xl bg-rose-600/10 text-rose-400 border border-rose-500/20 hover:bg-rose-600/20 transition-all duration-200 flex items-center overflow-hidden"
            >
              <svg
                class="w-3.5 h-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span
                class="max-w-0 group-hover:max-w-[8rem] overflow-hidden transition-all duration-200 whitespace-nowrap text-xs font-medium group-hover:ml-1.5"
              >
                {{ t("dashboard.deleteCalendar") }}
              </span>
            </button>
          </template>

          <!-- Separator -->
          <div class="w-px h-5 bg-white/10 dark:bg-white/10 mx-1"></div>

          <!-- Generate -->
          <button
            v-if="!currentCalendar"
            @click="showModal = true"
            class="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-colors flex items-center gap-1.5"
          >
            <svg
              class="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <strong>{{ t("dashboard.generatePlan") }}</strong>
          </button>
          <!-- Regenerate -->
          <button
            v-if="currentCalendar"
            @click="openRegenerate"
            class="group px-2.5 py-2 rounded-xl theme-card theme-border theme-sub hover:theme-text transition-all duration-200 flex items-center overflow-hidden"
          >
            <svg
              class="w-3.5 h-3.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span
              class="max-w-0 group-hover:max-w-[8rem] overflow-hidden transition-all duration-200 whitespace-nowrap text-xs font-medium group-hover:ml-1.5"
            >
              {{ t("dashboard.regenerateCalendar") }}
            </span>
          </button>
        </div>
      </div>

      <div class="flex flex-1 overflow-hidden">
        <!-- Calendar area -->
        <div class="flex-1 overflow-auto p-6">
          <div class="grid grid-cols-7 gap-2 mb-3">
            <div
              v-for="d in weekDays"
              :key="d"
              class="text-center text-[11px] theme-muted font-medium py-1"
            >
              {{ d }}
            </div>
          </div>

          <!-- Empty state -->
          <div
            v-if="filteredWeeks.length === 0 && !loadingCalendar"
            class="flex flex-col items-center justify-center py-24 theme-sub gap-3"
          >
            <svg
              class="w-12 h-12 opacity-20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {{ t("dashboard.generatePlan") }}
          </div>

          <!-- Loading state -->
          <div
            v-if="loadingCalendar"
            class="flex flex-col items-center justify-center py-24 gap-3 theme-sub"
          >
            <svg
              class="w-8 h-8 animate-spin text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <p class="text-sm">{{ t("dashboard.generating") }}</p>
            <p class="text-xs opacity-60">
              {{ t("dashboard.generatingHint") }}
            </p>
          </div>

          <!-- Weeks -->
          <div v-if="!loadingCalendar" class="space-y-3">
            <div
              v-for="week in filteredWeeks"
              :key="week.id"
              class="grid grid-cols-7 gap-3"
            >
              <div
                v-for="dayCell in week.cells"
                :key="dayCell.id"
                @dragover.prevent
                @dragenter="dragOverId = dayCell.rawDate"
                @dragleave="dragOverId = null"
                @drop="onDrop(dayCell)"
                class="rounded-xl border p-2 flex flex-col min-h-[160px] transition-all bg-forge-900/40"
                :class="[
                  dragOverId === dayCell.rawDate && dayCell.rawDate
                    ? 'ring-2 ring-amber-400/50 border-amber-400/50 bg-amber-500/5 scale-[1.01]'
                    : '',
                  dayCell.cellClass,
                ]"
                style="border-color: var(--border)"
              >
                <div class="flex items-center justify-between mb-2 px-1">
                  <span
                    class="text-[11px] font-semibold tracking-wide"
                    :class="
                      dayCell.posts && dayCell.posts.length > 0
                        ? 'theme-text'
                        : 'theme-muted'
                    "
                  >
                    {{ dayCell.date }}
                  </span>
                  <span
                    v-if="dayCell.posts && dayCell.posts.length > 1"
                    class="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-medium"
                  >
                    {{ dayCell.posts.length }} {{ t("dashboard.posts") }}
                  </span>
                </div>

                <div
                  class="flex flex-col gap-2 flex-1 overflow-y-auto overflow-x-hidden max-h-[280px] custom-scrollbar"
                >
                  <template v-if="dayCell.posts && dayCell.posts.length > 0">
                    <div
                      v-for="post in dayCell.posts"
                      :key="post._id || post.id"
                      draggable="true"
                      @dragstart="onDragStart(post)"
                      @click.stop="selectPost(post)"
                      class="relative rounded-lg border p-2.5 flex flex-col justify-between transition-all aspect-square w-full cursor-grab hover:scale-[1.02] active:cursor-grabbing shadow-sm"
                      :class="[statusToClass(post.status)]"
                    >
                      <div class="flex items-start justify-between">
                        <span class="text-[9px] font-mono opacity-60 text-left">
                          {{ dayCell.date }}
                        </span>
                        <span
                          v-if="post.platform"
                          class="text-[8px] px-1.5 py-0.5 rounded font-medium transform -mt-0.5"
                          :class="platformBadge(post.platform)"
                        >
                          {{
                            t(
                              `dashboard.platformName.${post.platform}`,
                              post.platform
                            )
                          }}
                        </span>
                      </div>

                      <p
                        class="text-[10px] leading-snug theme-sub flex-1 line-clamp-3 mt-1.5 text-left"
                      >
                        {{ post.copyAR || post.copy || post.text }}
                      </p>

                      <div
                        class="flex items-center justify-between mt-1 pt-1 border-t border-white/5"
                      >
                        <span
                          v-if="post.status"
                          class="text-[8px] font-medium tracking-wide"
                          :class="statusColor(post.status)"
                        >
                          ●
                          {{
                            t(
                              `dashboard.statusName.${post.status}`,
                              post.status
                            )
                          }}
                        </span>
                      </div>
                    </div>
                  </template>

                  <div
                    v-else-if="dayCell.rawDate"
                    class="text-[10px] theme-muted flex-1 flex items-center justify-center opacity-40 italic py-4"
                  >
                    —
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Legend -->
          <div
            v-if="filteredWeeks.length > 0"
            class="flex items-center gap-5 flex-wrap mt-5 pt-4 border-t"
            style="border-color: var(--border)"
          >
            <p class="text-[11px] theme-muted font-medium">
              {{ t("dashboard.status") }}:
            </p>
            <div
              v-for="s in legend"
              :key="s.labelKey"
              class="flex items-center gap-1.5"
            >
              <div class="w-1.5 h-1.5 rounded-full" :class="s.dot"></div>
              <span class="text-[10px] theme-sub">{{ t(s.labelKey) }}</span>
            </div>
          </div>
        </div>

        <!-- Right panel -->
        <div
          class="w-64 shrink-0 border-l overflow-y-auto p-4 space-y-4"
          style="border-color: var(--border)"
        >
          <!-- Post editor -->
          <div
            v-if="selectedPost"
            class="rounded-xl theme-surface theme-border p-4"
          >
            <div class="flex items-center justify-between mb-3">
              <p class="text-xs font-medium theme-text">
                {{ t("dashboard.editPost") }}
              </p>
              <button
                @click="selectedPost = null"
                class="theme-muted hover:theme-text"
              >
                <svg
                  class="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div class="flex gap-1.5 mb-3 flex-wrap">
              <span
                class="text-[10px] px-2 py-0.5 rounded-full font-medium"
                :class="platformBadge(selectedPost.platform)"
                >{{
                  t(
                    `dashboard.platformName.${selectedPost.platform}`,
                    selectedPost.platform
                  )
                }}</span
              >
              <span
                class="text-[10px] px-2 py-0.5 rounded-full theme-card theme-border theme-muted"
                >{{ selectedPost.dialect || t("dashboard.arabic") }}</span
              >
            </div>
            <textarea
              v-model="editCopy"
              rows="5"
              class="w-full theme-input rounded-lg p-2.5 text-xs theme-text border focus:outline-none focus:border-blue-500/40 resize-none leading-relaxed"
              style="border-color: var(--border)"
            ></textarea>
            <div class="mt-2 p-2 rounded-lg theme-card theme-border">
              <p class="text-[9px] theme-muted mb-1">
                {{ t("dashboard.hashtags") }}
              </p>
              <p class="text-[10px] text-blue-400">
                {{ selectedPost.hashtags?.join(" ") || "—" }}
              </p>
            </div>
            <div class="mt-3 space-y-1">
              <p class="text-[10px] theme-muted mb-2">
                {{ t("dashboard.status") }}
              </p>
              <button
                v-for="s in statuses"
                :key="s.labelKey"
                @click="selectedPost.status = s.value"
                class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] transition-colors text-left border"
                :class="
                  selectedPost.status === s.value
                    ? 'bg-blue-600/15 text-blue-400 border-blue-500/20'
                    : 'theme-sub border-transparent hover:theme-text'
                "
              >
                <div
                  class="w-1.5 h-1.5 rounded-full shrink-0"
                  :class="s.dot"
                ></div>
                {{ t(s.labelKey) }}
              </button>
            </div>
            <p
              v-if="saveMsg"
              class="text-[10px] text-green-400 mt-2 text-center"
            >
              {{ saveMsg }}
            </p>
            <button
              @click="savePost"
              :disabled="saving"
              class="w-full mt-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {{ saving ? t("dashboard.saving") : t("dashboard.saveChanges") }}
            </button>
          </div>
          <div
            v-else
            class="rounded-xl theme-card theme-border p-4 text-center"
          >
            <p class="text-xs theme-muted">{{ t("dashboard.clickToEdit") }}</p>
          </div>

          <!-- A/B Critic -->
          <div
            v-if="selectedPost"
            class="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"
          >
            <div class="flex items-center gap-2 mb-2">
              <span class="text-amber-400">⚡</span>
              <p class="text-xs font-medium text-amber-300">
                {{ t("dashboard.abCritic") }}
              </p>
            </div>
            <p
              v-if="!variantB"
              class="text-[11px] theme-sub leading-relaxed mb-3"
            >
              {{ t("dashboard.abHint") }}
            </p>
            <div
              v-if="variantB && variantB.copyAR"
              class="p-2.5 rounded-lg theme-card theme-border mb-3"
            >
              <p class="text-[10px] theme-sub italic leading-relaxed">
                {{ variantB.copyAR }}
              </p>
              <div
                v-if="variantB.hashtags?.length"
                class="flex flex-wrap gap-1 mt-1.5"
              >
                <span
                  v-for="tag in variantB.hashtags"
                  :key="tag"
                  class="text-[9px] text-blue-400"
                  >#{{ tag.replace("#", "") }}</span
                >
              </div>
            </div>
            <div v-if="variantB" class="flex gap-2 mb-2">
              <button
                @click="applyVariantB"
                class="flex-1 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 text-[10px] hover:bg-amber-500/25 border border-amber-500/20 transition-colors"
              >
                {{ t("dashboard.useB") }}
              </button>
              <button
                @click="variantB = null"
                class="flex-1 py-1.5 rounded-lg theme-card theme-border theme-muted text-[10px] hover:theme-text transition-colors"
              >
                {{ t("dashboard.keepA") }}
              </button>
            </div>
            <button
              @click="generateVariantB"
              :disabled="loadingVariant"
              class="w-full py-1.5 rounded-lg theme-card theme-border theme-muted text-[10px] hover:theme-text transition-colors"
            >
              {{
                loadingVariant
                  ? t("dashboard.generatingVariant")
                  : t("dashboard.generateVariantB")
              }}
            </button>
          </div>

          <!-- محتاجه تتعمل عربي وانجليزي -->
          <!-- Image Generator -->
          <div
            v-if="selectedPost"
            class="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4"
          >
            <div class="flex items-center gap-2 mb-3">
              <span class="text-blue-400">🎨</span>
              <p class="text-xs font-medium text-blue-300">AI Image</p>
              <span
                class="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/20 ml-auto"
                >FLUX</span
              >
            </div>

            <!-- صورة موجودة -->
            <div v-if="selectedPost.imageUrl" class="mb-3">
              <img
                :src="selectedPost.imageUrl"
                alt="Generated image"
                class="w-full rounded-lg object-cover aspect-square border border-blue-500/20"
              />
              <p
                class="text-[9px] theme-muted mt-1.5 leading-relaxed italic line-clamp-2"
              >
                {{ selectedPost.imagePrompt }}
              </p>
            </div>

            <!-- Empty state -->
            <div
              v-else-if="!generatingImage"
              class="mb-3 py-6 flex flex-col items-center gap-2 rounded-lg theme-card theme-border"
            >
              <span class="text-2xl opacity-30">🖼️</span>
              <p class="text-[10px] theme-muted text-center">
                No image yet —<br />generate one for this post
              </p>
            </div>

            <!-- Loading -->
            <div
              v-if="generatingImage"
              class="mb-3 py-6 flex flex-col items-center gap-2 rounded-lg theme-card theme-border"
            >
              <svg
                class="w-6 h-6 animate-spin text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p class="text-[10px] theme-muted">Generating image…</p>
              <p class="text-[9px] theme-muted opacity-60">~20–40 seconds</p>
            </div>

            <p v-if="imageError" class="text-[10px] text-rose-400 mb-2">
              {{ imageError }}
            </p>

            <button
              @click="generateImage"
              :disabled="generatingImage"
              class="w-full py-1.5 rounded-lg text-[10px] font-medium transition-colors disabled:opacity-50"
              :class="
                selectedPost.imageUrl
                  ? 'theme-card theme-border theme-muted hover:theme-text'
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              "
            >
              {{
                generatingImage
                  ? "Generating…"
                  : selectedPost.imageUrl
                  ? "↺ Regenerate Image"
                  : "✦ Generate Image"
              }}
            </button>
          </div>

          <!-- Trends -->
          <div class="rounded-xl theme-surface theme-border p-4">
            <div class="flex items-center justify-between mb-3">
              <p class="text-xs font-medium theme-text">
                🔥 {{ t("dashboard.trendingNow") }}
              </p>
              <span v-if="trendsLastUpdated" class="text-[9px] theme-muted">{{
                trendsLastUpdated
              }}</span>
            </div>
            <div class="space-y-2">
              <div
                v-for="t in trends"
                :key="t.tag"
                class="flex items-center justify-between"
              >
                <span class="text-[11px] theme-sub">{{ t.tag }}</span>
                <span class="text-[10px]" :class="t.color">{{ t.change }}</span>
              </div>
            </div>
            <button
              @click="injectTrend"
              class="w-full mt-3 py-1.5 rounded-lg theme-card theme-border theme-muted text-[10px] hover:theme-text transition-colors"
            >
              {{ t("dashboard.injectTrend") }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Generate / Regenerate Modal ── -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    >
      <div
        class="theme-surface rounded-2xl theme-border max-w-lg w-full p-7 theme-shadow"
      >
        <div class="flex items-center justify-between mb-5">
          <h2 class="font-display text-xl font-600 theme-text">
            {{
              isRegenerate
                ? t("dashboard.regenerateCalendar")
                : t("dashboard.generateNewPlan")
            }}
          </h2>
          <button
            @click="showModal = false"
            class="theme-muted hover:theme-text"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div
          v-if="isRegenerate"
          class="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs"
        >
          ⚠️ {{ t("dashboard.regenerateWarning") }}
        </div>

        <div
          v-if="!brandId"
          class="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs"
        >
          ⚠️ {{ t("dashboard.noBrandWarning") }}
        </div>

        <div class="space-y-4">
          <!-- Brief -->
          <div>
            <label class="text-xs theme-sub mb-1.5 block">{{
              t("dashboard.campaignBrief")
            }}</label>
            <textarea
              v-model="brief"
              rows="3"
              :placeholder="t('dashboard.briefPlaceholder')"
              class="w-full theme-input rounded-xl p-3.5 text-sm theme-text border resize-none focus:outline-none focus:border-blue-500/40"
              style="border-color: var(--border)"
            ></textarea>
          </div>

          <!-- Dialect + Start Date -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs theme-sub mb-1.5 block">{{
                t("dashboard.dialect")
              }}</label>
              <select
                v-model="selectedDialect"
                class="w-full theme-input rounded-xl px-3 py-2.5 text-sm theme-text border focus:outline-none"
                style="border-color: var(--border)"
              >
                <option
                  v-for="d in dialectOptions"
                  :key="d.value"
                  :value="d.value"
                >
                  {{ t(d.labelKey) }}
                </option>
              </select>
            </div>
            <div>
              <label class="text-xs theme-sub mb-1.5 block">{{
                t("dashboard.startDate")
              }}</label>
              <input
                type="date"
                v-model="startDate"
                @change="validateDates"
                class="w-full theme-input rounded-xl px-3 py-2.5 text-sm theme-text border focus:outline-none"
                style="border-color: var(--border)"
                :min="todayDate"
              />
            </div>
          </div>

          <!-- End Date -->
          <div>
            <label class="text-xs theme-sub mb-1.5 block">{{
              t("dashboard.endDate")
            }}</label>
            <input
              type="date"
              v-model="endDate"
              @change="validateDates"
              class="w-full theme-input rounded-xl px-3 py-2.5 text-sm theme-text border focus:outline-none"
              style="border-color: var(--border)"
              :min="startDate || todayDate"
            />
            <p class="text-[10px] theme-muted mt-1">{{ durationLabel }}</p>
            <p
              v-if="errorMessage"
              class="text-xs text-rose-400 font-medium mt-2"
            >
              {{ errorMessage }}
            </p>
          </div>

          <!-- Platforms -->
          <div>
            <label class="text-xs theme-sub mb-1.5 block">{{
              t("dashboard.platforms")
            }}</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="p in platforms"
                :key="p.name"
                @click="p.on = !p.on"
                class="px-3 py-1.5 rounded-lg text-xs border transition-all"
                :class="
                  p.on
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                    : 'theme-border theme-muted hover:theme-text'
                "
              >
                {{ t(p.labelKey) }}
              </button>
            </div>
          </div>

          <!-- Trends preview -->
          <div
            v-if="trends.length"
            class="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15"
          >
            <p class="text-[11px] text-amber-400 font-medium mb-1">
              ✦ {{ t("dashboard.trendsInjected") }}
            </p>
            <p class="text-[11px] theme-muted">
              {{
                trends
                  .slice(0, 3)
                  .map((t) => `${t.tag} (${t.change})`)
                  .join(" · ")
              }}
            </p>
          </div>

          <p v-if="generateError" class="text-xs text-rose-400">
            {{ generateError }}
          </p>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="showModal = false"
            class="flex-1 py-3 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors"
          >
            {{ t("common.cancel") }}
          </button>
          <button
            @click="doGenerate"
            :disabled="
              generating || !brief || !brandId || !startDate || !endDate
            "
            class="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {{
              generating
                ? t("dashboard.generatingLong")
                : isRegenerate
                ? t("dashboard.regenerateBtn")
                : t("dashboard.generateBtn")
            }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Reset Confirm Dialog ── -->
    <div
      v-if="showResetConfirm"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    >
      <div
        class="theme-surface rounded-2xl theme-border max-w-sm w-full p-6 theme-shadow"
      >
        <h2 class="font-display text-lg font-600 theme-text mb-2">
          {{ t("dashboard.resetTitle") }}
        </h2>
        <p class="text-sm theme-sub mb-6">{{ t("dashboard.resetDesc") }}</p>
        <div class="flex gap-3">
          <button
            @click="showResetConfirm = false"
            class="flex-1 py-2.5 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors"
          >
            {{ t("common.cancel") }}
          </button>
          <button
            @click="resetCalendar"
            :disabled="resetting"
            class="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm hover:bg-rose-500 transition-colors disabled:opacity-50"
          >
            {{ resetting ? t("dashboard.resetting") : t("dashboard.resetBtn") }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Delete Confirm Dialog ── -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    >
      <div
        class="theme-surface rounded-2xl theme-border max-w-sm w-full p-6 theme-shadow"
      >
        <h2 class="font-display text-lg font-600 theme-text mb-2">
          {{ t("dashboard.deleteTitle") }}
        </h2>
        <p class="text-sm theme-sub mb-6">{{ t("dashboard.deleteDesc") }}</p>
        <div class="flex gap-3">
          <button
            @click="showDeleteConfirm = false"
            class="flex-1 py-2.5 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors"
          >
            {{ t("common.cancel") }}
          </button>
          <button
            @click="deleteCalendar"
            :disabled="deleting"
            class="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm hover:bg-rose-500 transition-colors disabled:opacity-50"
          >
            {{ deleting ? t("dashboard.deleting") : t("dashboard.deleteBtn") }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Approve success toast ── -->
    <div
      v-if="approveMsg"
      class="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-green-600 text-white text-sm font-medium shadow-lg"
    >
      ✓ {{ approveMsg }}
    </div>
  </AppLayout>
</template>


<script setup>
import { ref, computed, onMounted, watch } from "vue";
import AppLayout from "../components/AppLayout.vue";
import calendarApi from "../api/calendarApi";
import postsApi from "../api/postsApi";
import api from "../api/client";
import { useI18n } from "vue-i18n";
import { useCalendarStore } from "../stores/calendarStore";

const { t } = useI18n();

// ── State ─────────────────────────────────────────────────────────────────────
const brandId = ref(localStorage.getItem("cf_brandId") || "");
const activeFilter = ref("All");
const selectedPost = ref(null);
const editCopy = ref("");
const showModal = ref(false);
const showDeleteConfirm = ref(false);
const showResetConfirm = ref(false);
const isRegenerate = ref(false);
const brief = ref("");
const selectedDialect = ref("Egyptian Arabic");
const todayDate = computed(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
});
const startDate = ref("");
const endDate = ref("");
const generating = ref(false);
const generateError = ref("");
const loadingCalendar = ref(false);
const saving = ref(false);
const saveMsg = ref("");
const approving = ref(false);
const approveMsg = ref("");
const deleting = ref(false);
const resetting = ref(false);
const variantB = ref(null);
const loadingVariant = ref(false);
const generatingImage = ref(false);
const imageError = ref("");
const errorMessage = ref("");
const currentCalendar = ref(null);
const trends = ref([]);
const trendsLastUpdated = ref("");
const store = useCalendarStore();
const planApproved = ref(false);
const imageError = ref("");
const generatingImage = ref(false);

// ── Drag & Drop state ─────────────────────────────────────────────────────
const draggedCell = ref(null);
const dragOverId = ref(null);

// weekDays use i18n keys — reactive to locale switching
const weekDays = computed(() => [
  t("dashboard.day.mon"),
  t("dashboard.day.tue"),
  t("dashboard.day.wed"),
  t("dashboard.day.thu"),
  t("dashboard.day.fri"),
  t("dashboard.day.sat"),
  t("dashboard.day.sun"),
]);

// Statuses: value stays English (used for API/logic), labelKey for display
const statuses = [
  { value: "Draft", labelKey: "dashboard.statusDraft", dot: "bg-slate-500" },
  {
    value: "Pending",
    labelKey: "dashboard.statusPending",
    dot: "bg-amber-400",
  },
  {
    value: "Approved",
    labelKey: "dashboard.statusApproved",
    dot: "bg-green-400",
  },
  {
    value: "Scheduled",
    labelKey: "dashboard.statusScheduled",
    dot: "bg-blue-400",
  },
  {
    value: "Published",
    labelKey: "dashboard.statusPublished",
    dot: "bg-teal-400",
  },
];

const legend = [
  { labelKey: "dashboard.statusApproved", dot: "bg-green-400" },
  { labelKey: "dashboard.statusScheduled", dot: "bg-blue-400" },
  { labelKey: "dashboard.statusPending", dot: "bg-amber-400" },
  { labelKey: "dashboard.statusDraft", dot: "bg-slate-500" },
];

const platforms = ref([
  { name: "Instagram", labelKey: "dashboard.platformName.Instagram", on: true },
  { name: "Facebook", labelKey: "dashboard.platformName.Facebook", on: true },
  { name: "LinkedIn", labelKey: "dashboard.platformName.LinkedIn", on: false },
  {
    name: "Twitter/X",
    labelKey: "dashboard.platformName.Twitter/X",
    on: false,
  },
  { name: "TikTok", labelKey: "dashboard.platformName.TikTok", on: false },
]);

// Dialect select options — value stays English for API, labelKey for display
const dialectOptions = [
  { value: "Egyptian Arabic", labelKey: "dashboard.dialect.egyptian" },
  { value: "Gulf Arabic", labelKey: "dashboard.dialect.gulf" },
  { value: "Levantine Arabic", labelKey: "dashboard.dialect.levantine" },
  { value: "Modern Standard Arabic", labelKey: "dashboard.dialect.msa" },
  { value: "Bilingual AR+EN", labelKey: "dashboard.dialect.bilingual" },
];

// ── Computed ──────────────────────────────────────────────────────────────────
const topTrend = computed(() => trends.value[0] || null);

const duration = computed(() => {
  if (!startDate.value || !endDate.value) return 0;
  return Math.round(
    (new Date(endDate.value) - new Date(startDate.value)) /
      (1000 * 60 * 60 * 24)
  );
});

const durationLabel = computed(() => {
  if (!startDate.value || !endDate.value) return "";
  if (duration.value <= 0) return t("dashboard.dateError");
  return t("dashboard.durationLabel", {
    days: duration.value,
    posts: Math.round(duration.value * 0.65),
  });
});

// Re-built reactively based on Pinia store array state
const calendarWeeks = computed(() => {
  const startStr = currentCalendar.value?.startDate || startDate.value;
  const endStr = currentCalendar.value?.endDate || endDate.value;
  if (!startStr || !endStr) return [];

  const start = new Date(startStr);
  const end = new Date(endStr);

  const dateSlots = [];
  let current = new Date(start);
  while (current <= end) {
    dateSlots.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  const initialDay = new Date(dateSlots[0]).getDay();
  const offset = initialDay === 0 ? 6 : initialDay - 1;
  for (let i = 0; i < offset; i++) {
    dateSlots.unshift(null);
  }

  const weeks = [];
  let weekCells = [];
  let weekId = 0;

  dateSlots.forEach((dateStr, index) => {
    if (dateStr === null) {
      weekCells.push({
        id: `pad-${index}`,
        date: "",
        rawDate: null,
        posts: [],
        cellClass:
          "bg-transparent opacity-30 border-transparent pointer-events-none",
      });
    } else {
      const dayPosts = (store.posts || []).filter((p) => {
        const pDate = p.date || p.scheduledAt;
        return pDate && pDate.substring(0, 10) === dateStr;
      });

      const [y, mo, d] = dateStr.split("-").map(Number);
      const formattedDate = new Date(y, mo - 1, d).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });

      weekCells.push({
        id: `cell-${dateStr}`,
        date: formattedDate,
        rawDate: dateStr,
        posts: dayPosts,
        cellClass:
          dayPosts.length > 0
            ? ""
            : "bg-slate-900/10 border-dashed border-slate-700/30",
      });
    }

    if (weekCells.length === 7 || index === dateSlots.length - 1) {
      while (weekCells.length < 7) {
        weekCells.push({
          id: `fill-${index}-${weekCells.length}`,
          date: "",
          rawDate: null,
          posts: [],
          cellClass: "bg-transparent",
        });
      }
      weeks.push({ id: weekId++, cells: weekCells });
      weekCells = [];
    }
  });

  return weeks;
});

// Refactored filters matching Option 1 properties
const filteredWeeks = computed(() => {
  if (activeFilter.value === "All") return calendarWeeks.value;
  return calendarWeeks.value.map((week) => ({
    ...week,
    cells: week.cells.map((cell) => ({
      ...cell,
      posts: cell.posts.filter((p) => {
        const cleanStatus = p.status
          ? p.status.toLowerCase().replace("_", " ")
          : "";
        return cleanStatus === activeFilter.value.toLowerCase();
      }),
    })),
  }));
});

const calendarDateRange = computed(() => {
  if (!currentCalendar.value) return "";
  const s = new Date(currentCalendar.value.startDate);
  const e = new Date(currentCalendar.value.endDate);
  return `${s.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })} – ${e.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
});

// ── Helpers for dates ─────────────────────────────────────────────────────────
function validateDates() {
  errorMessage.value = "";
  if (startDate.value && startDate.value < todayDate.value) {
    startDate.value = todayDate.value;
    errorMessage.value = t("dashboard.pastDateError");
  }
  if (endDate.value && startDate.value && endDate.value < startDate.value) {
    endDate.value = startDate.value;
  }
}

watch(
  todayDate,
  (newDate) => {
    if (!startDate.value) startDate.value = newDate;
  },
  { immediate: true }
);

// ── Load on mount ─────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const data = await api.get("/trends");
    trends.value = data.trends.map((t) => ({
      ...t,
      color: t.velocity > 200 ? "text-green-400" : "text-teal-400",
    }));
    trendsLastUpdated.value = new Date(data.lastUpdated).toLocaleTimeString(
      "ar-EG"
    );
  } catch (err) {
    console.error(err);
  }

  if (!brandId.value) return;
  try {
    const calendars = await calendarApi.getBrandCalendars(brandId.value);
    if (calendars?.length) {
      const latest = await calendarApi.getCalendar(calendars[0]._id);
      currentCalendar.value = latest;
      store.posts = latest.posts || [];
    }
  } catch (err) {
    console.error(err);
  }
});

// ── Generate / Regenerate ─────────────────────────────────────────────────────
function openRegenerate() {
  isRegenerate.value = true;
  showModal.value = true;
}

async function doGenerate() {
  if (!brief.value || !brandId.value || !startDate.value || !endDate.value)
    return;
  generateError.value = "";
  generating.value = true;
  loadingCalendar.value = true;
  showModal.value = false;

  try {
    validateDates();
    if (isRegenerate.value && currentCalendar.value) {
      await calendarApi
        .deleteCalendar(currentCalendar.value._id)
        .catch(() => {});
      currentCalendar.value = null;
      store.posts = [];
    }
    const result = await calendarApi.generate({
      brandId: brandId.value,
      brief: brief.value,
      dialect: selectedDialect.value,
      platforms: platforms.value.filter((p) => p.on).map((p) => p.name),
      startDate: startDate.value,
      endDate: endDate.value,
      duration: duration.value,
    });
    currentCalendar.value = result.calendar;
    store.posts = result.posts || [];
    brief.value = "";
    isRegenerate.value = false;
    planApproved.value = false;
  } catch (err) {
    generateError.value = err.message || t("dashboard.generationFailed");
    showModal.value = true;
  } finally {
    generating.value = false;
    loadingCalendar.value = false;
  }
}

// ── Approve Plan ──────────────────────────────────────────────────────────────
async function approvePlan() {
  if (!currentCalendar.value) return;
  approving.value = true;
  try {
    await calendarApi.approveCalendar(currentCalendar.value._id);
    store.posts = store.posts.map((p) => ({ ...p, status: "approved" }));
    approveMsg.value = t("dashboard.allApproved");
    planApproved.value = true;
    setTimeout(() => (approveMsg.value = ""), 3000);
  } catch (err) {
    alert(t("dashboard.approveFailed") + ": " + err.message);
  } finally {
    approving.value = false;
  }
}

// ── Delete Calendar ───────────────────────────────────────────────────────────
function confirmDelete() {
  showDeleteConfirm.value = true;
}

async function deleteCalendar() {
  if (!currentCalendar.value) return;
  deleting.value = true;
  try {
    await calendarApi.deleteCalendar(currentCalendar.value._id);
    currentCalendar.value = null;
    store.posts = [];
    selectedPost.value = null;
    showDeleteConfirm.value = false;
    isRegenerate.value = false;
  } catch (err) {
    alert(t("dashboard.deleteFailed") + ": " + err.message);
  } finally {
    deleting.value = false;
  }
}

// ── Reset Calendar ────────────────────────────────────────────────────────────
function confirmReset() {
  showResetConfirm.value = true;
}

async function resetCalendar() {
  if (!currentCalendar.value) return;
  resetting.value = true;
  try {
    await store.resetCalendar(currentCalendar.value._id);
    currentCalendar.value = store.calendar;
    selectedPost.value = null;
    variantB.value = null;
    planApproved.value = false;
    showResetConfirm.value = false;
  } catch (err) {
    alert(t("dashboard.resetFailed") + ": " + err.message);
  } finally {
    resetting.value = false;
  }
}

// ── Build weeks grid ──────────────────────────────────────────────────────────
function buildWeeks(posts) {
  if (!currentCalendar.value || !posts) return [];
  const start = new Date(currentCalendar.value.startDate);
  const end = new Date(currentCalendar.value.endDate);
  const dateSlots = [];
  let current = new Date(start);
  while (current <= end) {
    dateSlots.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  const initialDay = new Date(dateSlots[0]).getDay();
  const offset = initialDay === 0 ? 6 : initialDay - 1;
  for (let i = 0; i < offset; i++) dateSlots.unshift(null);
  const weeks = [];
  let weekCells = [];
  let weekId = 0;
  dateSlots.forEach((dateStr, index) => {
    if (dateStr === null) {
      weekCells.push({
        id: `pad-${index}`,
        date: "",
        rawDate: null,
        copy: null,
        cellClass:
          "bg-transparent opacity-30 border-transparent pointer-events-none",
      });
    } else {
      const post = posts.find((p) => {
        const pDate = p.date || p.scheduledAt || p.scheduledDate;
        return pDate && pDate.startsWith(dateStr);
      });
      if (post) {
        const [y, mo, d] = dateStr.split("-").map(Number);
        weekCells.push({
          id: post._id,
          date: new Date(y, mo - 1, d).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
          }),
          rawDate: dateStr,
          platform: (post.platform || "").slice(0, 2).toUpperCase(),
          copy: post.copyAR || post.copy || "",
          dialect: post.dialect || "",
          status: post.status
            ? post.status.charAt(0).toUpperCase() +
              post.status.slice(1).replace("_", " ")
            : "Draft",
          hashtags: post.hashtags || [],
          cellClass: statusToClass(post.status),
        });
      } else {
        const [ey, em, ed] = dateStr.split("-").map(Number);
        weekCells.push({
          id: `empty-${dateStr}`,
          date: new Date(ey, em - 1, ed).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
          }),
          rawDate: dateStr,
          platform: null,
          copy: null,
          status: null,
          hashtags: [],
          cellClass: "bg-slate-900/10 border-dashed border-slate-700/30",
        });
      }
    }
    if (weekCells.length === 7 || index === dateSlots.length - 1) {
      while (weekCells.length < 7)
        weekCells.push({
          id: `fill-${index}-${weekCells.length}`,
          date: "",
          rawDate: null,
          copy: null,
          cellClass: "bg-transparent",
        });
      weeks.push({ id: weekId++, cells: weekCells });
      weekCells = [];
    }
  });
  return weeks;
}

function statusToClass(status) {
  return (
    {
      draft: "border-slate-700 bg-slate-800/40",
      pending_review: "border-amber-500/20 bg-amber-500/5",
      approved: "border-green-500/25 bg-green-500/5",
      scheduled: "border-blue-500/25 bg-blue-500/5",
      published: "border-teal-500/25 bg-teal-500/5",
    }[status] || "border-slate-700 bg-slate-800/40"
  );
}

// ── Post editor ───────────────────────────────────────────────────────────────
function selectPost(post) {
  selectedPost.value = post;
  editCopy.value = post.copyAR || post.copy || post.text || "";
  variantB.value = null;
  saveMsg.value = "";
}

async function savePost() {
  if (!selectedPost.value) return;
  saving.value = true;
  saveMsg.value = "";
  const postId = selectedPost.value._id || selectedPost.value.id;
  const formattedStatus = selectedPost.value.status
    .toLowerCase()
    .replace(" ", "_");
  try {
    await postsApi.updatePost(postId, {
      copyAR: editCopy.value,
      status: formattedStatus,
    });
    store.posts = store.posts.map((p) =>
      p._id === postId || p.id === postId
        ? {
            ...p,
            copyAR: editCopy.value,
            copy: editCopy.value,
            status: formattedStatus,
          }
        : p
    );
    // تحديث نفس الكائن المختار حالياً بالشاشة
    selectedPost.value.copyAR = editCopy.value;
    selectedPost.value.status = formattedStatus;

    saveMsg.value = t("dashboard.saved");
  } catch {
    saveMsg.value = t("dashboard.savedLocally");
  } finally {
    saving.value = false;
    setTimeout(() => (saveMsg.value = ""), 2000);
  }
}

// ── A/B Variant ───────────────────────────────────────────────────────────────

async function generateVariantB() {
  if (!selectedPost.value) return;
  loadingVariant.value = true;
  variantB.value = null;
  try {
    const postId = selectedPost.value._id || selectedPost.value.id;
    const r = await postsApi.generateVariantB(postId);

    // فحص ذكي جدا لشكل الـ Response وحقنه داخل الكائن ليتطابق مع طريقة العرض
    if (r && typeof r === "object") {
      variantB.value = {
        copyAR: r.copyAR || r.text || r.copy || r.output || "",
        hashtags: r.hashtags || [],
      };
    } else if (typeof r === "string") {
      variantB.value = {
        copyAR: r,
        hashtags: [],
      };
    }
  } catch (err) {
    console.error(err);
    variantB.value = {
      copyAR: "Could not generate variant, please try again.",
      hashtags: [],
    };
  } finally {
    loadingVariant.value = false;
  }
}

async function applyVariantB() {
  if (!selectedPost.value || !variantB.value) return;

  editCopy.value = variantB.value.copyAR;
  selectedPost.value.copyAR = variantB.value.copyAR;
  selectedPost.value.copy = variantB.value.copyAR;
  selectedPost.value.hashtags = variantB.value.hashtags;

  const postId = selectedPost.value._id || selectedPost.value.id;

  // تحديث الـ Store بالـ Copy الجديد فوراً
  store.posts = store.posts.map((p) =>
    p._id === postId || p.id === postId
      ? {
          ...p,
          copyAR: variantB.value.copyAR,
          copy: variantB.value.copyAR,
          hashtags: variantB.value.hashtags,
        }
      : p
  );

  variantB.value = null;
  try {
    await postsApi.applyVariantB(postId);
  } catch (err) {
    console.error(err);
  }
}

// ── Generate Image ────────────────────────────────────────────────────────────
async function generateImage() {
  if (!selectedPost.value) return;
  generatingImage.value = true;
  imageError.value = "";
  const postId = selectedPost.value._id || selectedPost.value.id;
  try {
    const data = await postsApi.generateImage(postId);
    selectedPost.value.imageUrl = data.imageUrl;
    selectedPost.value.imagePrompt = data.imagePrompt;

    store.posts = store.posts.map((p) =>
      p._id === postId || p.id === postId
        ? { ...p, imageUrl: data.imageUrl, imagePrompt: data.imagePrompt }
        : p
    );
  } catch (err) {
    imageError.value = err.message?.includes("loading")
      ? "Model warming up — try again in 30s"
      : "Failed: " + (err.message || "Unknown error");
  } finally {
    generatingImage.value = false;
  }
}

// ── Inject trend ──────────────────────────────────────────────────────────────
function injectTrend() {
  if (!selectedPost.value || !trends.value[0]) return;
  const tag = trends.value[0].tag;
  if (!editCopy.value.includes(tag)) editCopy.value += " " + tag;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function platformBadge(p) {
  return (
    {
      IG: "bg-pink-500/20 text-pink-400",
      FB: "bg-blue-500/20 text-blue-400",
      LI: "bg-blue-700/20 text-blue-300",
      TW: "bg-sky-500/20 text-sky-400",
      TI: "bg-rose-500/20 text-rose-400",
    }[p] || "bg-slate-500/20 text-slate-400"
  );
}

function statusColor(s) {
  return (
    {
      Approved: "text-green-400",
      Scheduled: "text-blue-400",
      Pending: "text-amber-400",
      "Pending Review": "text-amber-400",
      Draft: "text-slate-500",
      Published: "text-teal-400",
    }[s] || "text-slate-500"
  );
}

// ── Drag & Drop Handlers ───────────────────────────────────────────────────
function onDragStart(cell) {
  draggedCell.value = cell;
}

async function onDrop(targetCell) {
  dragOverId.value = null;
  if (!draggedCell.value || !targetCell.rawDate) return;
  planApproved.value = false;
  const currentPostDate =
    draggedCell.value.date || draggedCell.value.scheduledAt;
  if (currentPostDate?.substring(0, 10) === targetCell.rawDate) {
    draggedCell.value = null;
    return;
  }
  const postId = draggedCell.value._id || draggedCell.value.id;
  const newDate = targetCell.rawDate;
  const wasApproved = draggedCell.value.status === "approved";
  try {
    await store.movePostDate(postId, newDate);
    if (wasApproved) {
      await postsApi.updatePost(postId, { status: "draft" });
      store.posts = store.posts.map((p) =>
        p._id === postId || p.id === postId ? { ...p, status: "draft" } : p
      );
    }
  } catch (err) {
    alert(t("dashboard.moveFailed") + ": " + err.message);
  } finally {
    draggedCell.value = null;
  }
}
</script>
<style scoped>
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.3);
}

::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

.aspect-square {
  aspect-ratio: 1 / 1;
}
</style>
