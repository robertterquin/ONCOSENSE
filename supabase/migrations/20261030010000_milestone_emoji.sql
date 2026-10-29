-- Removes emoji from milestones saved by the Flutter app ("Journey Started 🌟"). The app
-- already hides them when it loads milestones; this cleans the stored rows too.

update public.journey_milestones
set
  title = btrim(regexp_replace(regexp_replace(title, '[\U0001F000-\U0001FAFF☀-➿⭐️‍]', '', 'g'), '\s{2,}', ' ', 'g')),
  description = btrim(regexp_replace(regexp_replace(description, '[\U0001F000-\U0001FAFF☀-➿⭐️‍]', '', 'g'), '\s{2,}', ' ', 'g'))
where title ~ '[\U0001F000-\U0001FAFF☀-➿⭐]'
   or description ~ '[\U0001F000-\U0001FAFF☀-➿⭐]';

-- The same Flutter milestone in sentence case, like the app's own "Journey started".
update public.journey_milestones set title = 'Journey started' where title = 'Journey Started';
