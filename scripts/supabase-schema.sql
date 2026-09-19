create table if not exists legal_articles (
  id bigserial primary key,
  article_number text not null,
  source text not null,          -- 'fuqarolik_kodeksi' | 'uy_joy_kodeksi'
  title text,
  article_text text not null,
  is_verbatim boolean not null default false,  -- true only if text is exact law wording, not a paraphrase
  created_at timestamptz not null default now()
);
