FROM chiskat/baseline-node20:2026.4.26

ARG NPM_REGISTRY=https://registry.npmjs.org

EXPOSE 3000
WORKDIR /paperplane.cc

ENV NODE_ENV=production
ENV DO_NOT_TRACK=1

COPY .docker-deps /paperplane.cc
RUN --mount=type=cache,id=pnpm,target=/paperplane.cc/.pnpm-store pnpm i --frozen-lockfile --store-dir /paperplane.cc/.pnpm-store --registry=$NPM_REGISTRY

COPY . /paperplane.cc/
RUN pnpm run build:prod

CMD [ "pnpm", "run", "start:prod" ]
