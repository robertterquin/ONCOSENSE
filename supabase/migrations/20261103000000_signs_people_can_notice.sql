-- Signs people can notice themselves (content review, November 2026): the signs check
-- asks "any of these?", so a sign only a scan or blood test finds is reworded. Safe to
-- run twice: array_replace does nothing once the old wording is gone.

update public.cancer_types
set symptoms = array_replace(symptoms, 'Enlarged liver or spleen', 'Swelling or a full feeling under the ribs')
where name = 'Leukemia';

update public.cancer_types
set symptoms = array_replace(symptoms, 'Iron-deficiency anemia', 'Iron-deficiency anemia found in a blood test')
where name = 'Colorectal cancer';
