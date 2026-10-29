-- Sentence case for content titles (design refresh Phase 7). The app uses sentence
-- case everywhere else; these titles came from the original seed in Title Case.
-- Only the letter case changes. The app matches these titles case-insensitively, so
-- nothing else needs updating.

update public.self_check_guides set title = case id
  when 'a0c16896-9f80-428d-a535-808f74414907' then 'Breast self-exam'
  when '85012ffc-a74a-4e7b-8527-cace08395c75' then 'Skin cancer ABCDE check'
  when '278a3abe-1e73-4d0d-bf07-524077349ad6' then 'Oral cancer self-check'
  when 'c9388ecf-d045-4199-b2ef-18c7b51ba649' then 'Testicular self-exam'
  when 'ce6655be-f45a-44d1-8a56-0b8d4ae7fa13' then 'Colorectal health awareness'
  when '45d3a063-32b8-4ce2-9823-8cfd00a4d20f' then 'Cervical health monitoring'
  when 'ac6bea37-29e2-4d20-af62-d93185fd422c' then 'Prostate health monitoring'
  when 'eb5104e6-b103-4895-9d84-ad79def92f31' then 'Liver health awareness'
  when '05bb6dcd-9221-4059-90b9-6b5cda6a4544' then 'Stomach health monitoring'
  when '17c2df82-1b77-48c7-854b-6c3fa5a136b0' then 'Lung health monitoring'
  when '0238a69d-77e9-46ba-a0dd-977fa6ba34fe' then 'Ovarian health monitoring'
  when 'acdb3b98-543b-474d-a1bb-fec57c32110d' then 'Blood health awareness'
  else title
end;

update public.cancer_types set name = case id
  when 'e0b1999b-3f14-4971-868f-9575dc71f57f' then 'Breast cancer'
  when '7bacb1ab-f9e2-4e31-97a8-b37832a6de23' then 'Lung cancer'
  when '3f704938-a54a-4f73-a05f-f5db4eb23b5e' then 'Colorectal cancer'
  when '37a6ba50-858b-4e1c-86ac-4a181a710e98' then 'Prostate cancer'
  when 'de779526-f58a-43b8-8da1-df2302741ae2' then 'Cervical cancer'
  when 'f88ae351-7668-4c74-a014-c02988545af0' then 'Liver cancer'
  when '043b00a4-d45a-4373-9b91-22f1df3c01a5' then 'Stomach cancer'
  when 'f1a0c2e2-70a1-449c-8c97-91a6282b5146' then 'Skin cancer'
  when '7725e0ba-4fcc-4d05-9ee6-8e8a14556d77' then 'Ovarian cancer'
  else name
end;

update public.prevention_tips set title = case id
  when 'a209d639-07ad-45c8-ac45-95006b6af3ff' then 'Healthy diet'
  when '495a370a-e0f9-48a2-80ab-61fe87c8d23b' then 'Plant-based foods'
  when 'cc802d6d-66a2-4b06-b02e-947355ae16b7' then 'Regular exercise'
  when '4e2f8f41-0c52-443e-b33d-2896e2ac1d6e' then 'Stay active'
  when '9a1536e0-968d-4d38-a9f9-c3f4e872bfa9' then 'No smoking'
  when '65f3e030-2083-4f02-b561-f059f0608e09' then 'Limit alcohol'
  when '5aadac4d-dc85-438d-ae8a-f8d08d41d1d4' then 'Sun protection'
  when '6cbd74e3-3623-4860-8473-4eb7c8bb64dd' then 'Quality sleep'
  when '5396337a-8dca-444d-b8b0-f0382c33b6fd' then 'Healthy weight'
  when '485c7247-5446-4890-995d-50e53a84d331' then 'Regular screenings'
  when 'c79cc8a3-382c-4996-bba8-f3bc616ddb66' then 'Get vaccinated'
  when 'a016f51d-5536-494a-be87-7301b9d76073' then 'Stay hydrated'
  else title
end;

notify pgrst, 'reload schema';
