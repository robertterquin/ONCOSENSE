--
-- PostgreSQL database dump
--

\restrict t7EYMc9bkbygc5zcB5h6ZG3OWHmojYLJifZ8esA9ePaK73N6s9M51cEj04e8pOF

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: decrement_answer_count(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.decrement_answer_count(question_id_param uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE questions
  SET answer_count = GREATEST(answer_count - 1, 0)
  WHERE id = question_id_param;
END;
$$;


--
-- Name: decrement_answer_upvotes(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.decrement_answer_upvotes(answer_id_param uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE answers
  SET upvotes = GREATEST(upvotes - 1, 0)
  WHERE id = answer_id_param;
END;
$$;


--
-- Name: decrement_question_upvotes(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.decrement_question_upvotes(question_id_param uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE questions
  SET upvotes = GREATEST(upvotes - 1, 0)
  WHERE id = question_id_param;
END;
$$;


--
-- Name: increment_answer_count(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_answer_count(question_id_param uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE questions
  SET answer_count = answer_count + 1
  WHERE id = question_id_param;
END;
$$;


--
-- Name: increment_answer_upvotes(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_answer_upvotes(answer_id_param uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE answers
  SET upvotes = upvotes + 1
  WHERE id = answer_id_param;
END;
$$;


--
-- Name: increment_question_upvotes(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_question_upvotes(question_id_param uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE questions
  SET upvotes = upvotes + 1
  WHERE id = question_id_param;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: answer_votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.answer_votes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    answer_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.answers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_id uuid NOT NULL,
    content text NOT NULL,
    user_id uuid NOT NULL,
    user_name text,
    is_anonymous boolean DEFAULT false,
    upvotes integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_accepted boolean DEFAULT false,
    parent_answer_id uuid,
    profile_picture_url text
);


--
-- Name: answers_public; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.answers_public AS
 SELECT id,
    question_id,
    content,
        CASE
            WHEN ((NOT is_anonymous) OR (user_id = auth.uid())) THEN user_id
            ELSE NULL::uuid
        END AS user_id,
        CASE
            WHEN is_anonymous THEN NULL::text
            ELSE user_name
        END AS user_name,
    is_anonymous,
    upvotes,
    created_at,
    updated_at,
    is_accepted,
    parent_answer_id
   FROM public.answers;


--
-- Name: article_bookmarks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.article_bookmarks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    url text NOT NULL,
    image_url text,
    published_at text,
    source_name text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: cancer_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cancer_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    icon_name text NOT NULL,
    symptoms text[] NOT NULL,
    risk_factors text[] NOT NULL,
    prevention_tips text[] NOT NULL,
    screening_methods text[] NOT NULL,
    early_detection_info text NOT NULL,
    statistics text,
    created_at timestamp with time zone DEFAULT now(),
    source_name text,
    source_url text
);


--
-- Name: habit_bookmarks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.habit_bookmarks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    habit_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: habit_completions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.habit_completions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    habit_id text NOT NULL,
    completed_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: journey_appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journey_appointments (
    id text NOT NULL,
    user_id uuid DEFAULT auth.uid() NOT NULL,
    title text NOT NULL,
    starts_at timestamp with time zone NOT NULL,
    location text,
    notes text,
    treatment_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: journey_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journey_entries (
    id text NOT NULL,
    user_id uuid NOT NULL,
    date timestamp with time zone NOT NULL,
    mood_level integer NOT NULL,
    pain_level integer NOT NULL,
    energy_level integer NOT NULL,
    sleep_quality integer NOT NULL,
    symptoms text[] DEFAULT '{}'::text[],
    notes text,
    appointment_notes text,
    has_appointment boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT journey_entries_energy_level_check CHECK (((energy_level >= 1) AND (energy_level <= 10))),
    CONSTRAINT journey_entries_mood_level_check CHECK (((mood_level >= 1) AND (mood_level <= 5))),
    CONSTRAINT journey_entries_pain_level_check CHECK (((pain_level >= 0) AND (pain_level <= 10))),
    CONSTRAINT journey_entries_sleep_quality_check CHECK (((sleep_quality >= 1) AND (sleep_quality <= 5)))
);


--
-- Name: journey_milestones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journey_milestones (
    id text NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    type text NOT NULL,
    date_achieved timestamp with time zone NOT NULL,
    days_count integer,
    is_celebrated boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: journey_treatments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journey_treatments (
    id text NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    start_date timestamp with time zone NOT NULL,
    total_sessions integer DEFAULT 0,
    completed_sessions integer DEFAULT 0,
    side_effects text[] DEFAULT '{}'::text[],
    notes text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: prevention_tips; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prevention_tips (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    icon_name text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    detailed_info text,
    source_name text NOT NULL,
    source_url text NOT NULL,
    date_verified timestamp without time zone DEFAULT now(),
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: question_bookmarks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_bookmarks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    question_id text NOT NULL,
    title text NOT NULL,
    content text,
    category text,
    question_user_id text,
    question_user_name text,
    profile_picture_url text,
    is_anonymous boolean DEFAULT false,
    upvotes integer DEFAULT 0,
    answer_count integer DEFAULT 0,
    question_created_at timestamp with time zone,
    question_updated_at timestamp with time zone,
    is_resolved boolean DEFAULT false,
    tags text[],
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: question_votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_votes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    category text NOT NULL,
    user_id uuid NOT NULL,
    user_name text,
    is_anonymous boolean DEFAULT false,
    upvotes integer DEFAULT 0,
    answer_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_resolved boolean DEFAULT false,
    tags text[] DEFAULT '{}'::text[],
    profile_picture_url text,
    cancer_type_id uuid
);


--
-- Name: questions_public; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.questions_public AS
 SELECT id,
    title,
    content,
    category,
        CASE
            WHEN ((NOT is_anonymous) OR (user_id = auth.uid())) THEN user_id
            ELSE NULL::uuid
        END AS user_id,
        CASE
            WHEN is_anonymous THEN NULL::text
            ELSE user_name
        END AS user_name,
        CASE
            WHEN is_anonymous THEN NULL::text
            ELSE profile_picture_url
        END AS profile_picture_url,
    is_anonymous,
    upvotes,
    answer_count,
    created_at,
    updated_at,
    is_resolved,
    tags,
    cancer_type_id
   FROM public.questions;


--
-- Name: reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content_type text NOT NULL,
    content_id text NOT NULL,
    user_id uuid DEFAULT auth.uid() NOT NULL,
    reason text NOT NULL,
    additional_info text,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT reports_content_type_check CHECK ((content_type = ANY (ARRAY['question'::text, 'answer'::text])))
);


--
-- Name: resource_bookmarks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_bookmarks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    resource_id text NOT NULL,
    name text NOT NULL,
    type text,
    description text,
    phone text,
    location text,
    address text,
    website text,
    email text,
    is_verified boolean DEFAULT false,
    is_active boolean DEFAULT true,
    resource_created_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resources (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    description text NOT NULL,
    phone text,
    location text,
    address text,
    website text,
    email text,
    is_verified boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    checked_on date,
    CONSTRAINT resources_type_check CHECK ((type = ANY (ARRAY['hotline'::text, 'screening_center'::text, 'financial_support'::text, 'support_group'::text])))
);


--
-- Name: self_check_guides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.self_check_guides (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    cancer_type text NOT NULL,
    frequency text NOT NULL,
    age_recommendation text,
    steps jsonb NOT NULL,
    warning_signs jsonb,
    when_to_see_doctor text NOT NULL,
    source_name text NOT NULL,
    source_url text NOT NULL,
    date_verified timestamp without time zone DEFAULT now(),
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: self_check_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.self_check_progress (
    user_id uuid DEFAULT auth.uid() NOT NULL,
    guide_id text NOT NULL,
    last_done timestamp with time zone,
    saved boolean DEFAULT false NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    history jsonb DEFAULT '[]'::jsonb NOT NULL
);


--
-- Name: answer_votes answer_votes_answer_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer_votes
    ADD CONSTRAINT answer_votes_answer_id_user_id_key UNIQUE (answer_id, user_id);


--
-- Name: answer_votes answer_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer_votes
    ADD CONSTRAINT answer_votes_pkey PRIMARY KEY (id);


--
-- Name: answers answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_pkey PRIMARY KEY (id);


--
-- Name: article_bookmarks article_bookmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_bookmarks
    ADD CONSTRAINT article_bookmarks_pkey PRIMARY KEY (id);


--
-- Name: cancer_types cancer_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cancer_types
    ADD CONSTRAINT cancer_types_pkey PRIMARY KEY (id);


--
-- Name: habit_bookmarks habit_bookmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.habit_bookmarks
    ADD CONSTRAINT habit_bookmarks_pkey PRIMARY KEY (id);


--
-- Name: habit_bookmarks habit_bookmarks_user_id_habit_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.habit_bookmarks
    ADD CONSTRAINT habit_bookmarks_user_id_habit_id_key UNIQUE (user_id, habit_id);


--
-- Name: habit_completions habit_completions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.habit_completions
    ADD CONSTRAINT habit_completions_pkey PRIMARY KEY (id);


--
-- Name: habit_completions habit_completions_user_id_habit_id_completed_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.habit_completions
    ADD CONSTRAINT habit_completions_user_id_habit_id_completed_date_key UNIQUE (user_id, habit_id, completed_date);


--
-- Name: journey_appointments journey_appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journey_appointments
    ADD CONSTRAINT journey_appointments_pkey PRIMARY KEY (id);


--
-- Name: journey_entries journey_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journey_entries
    ADD CONSTRAINT journey_entries_pkey PRIMARY KEY (id);


--
-- Name: journey_milestones journey_milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journey_milestones
    ADD CONSTRAINT journey_milestones_pkey PRIMARY KEY (id);


--
-- Name: journey_treatments journey_treatments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journey_treatments
    ADD CONSTRAINT journey_treatments_pkey PRIMARY KEY (id);


--
-- Name: prevention_tips prevention_tips_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prevention_tips
    ADD CONSTRAINT prevention_tips_pkey PRIMARY KEY (id);


--
-- Name: question_bookmarks question_bookmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_bookmarks
    ADD CONSTRAINT question_bookmarks_pkey PRIMARY KEY (id);


--
-- Name: question_bookmarks question_bookmarks_user_id_question_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_bookmarks
    ADD CONSTRAINT question_bookmarks_user_id_question_id_key UNIQUE (user_id, question_id);


--
-- Name: question_votes question_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_votes
    ADD CONSTRAINT question_votes_pkey PRIMARY KEY (id);


--
-- Name: question_votes question_votes_question_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_votes
    ADD CONSTRAINT question_votes_question_id_user_id_key UNIQUE (question_id, user_id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: resource_bookmarks resource_bookmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_bookmarks
    ADD CONSTRAINT resource_bookmarks_pkey PRIMARY KEY (id);


--
-- Name: resource_bookmarks resource_bookmarks_user_id_resource_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_bookmarks
    ADD CONSTRAINT resource_bookmarks_user_id_resource_id_key UNIQUE (user_id, resource_id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: self_check_guides self_check_guides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.self_check_guides
    ADD CONSTRAINT self_check_guides_pkey PRIMARY KEY (id);


--
-- Name: self_check_progress self_check_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.self_check_progress
    ADD CONSTRAINT self_check_progress_pkey PRIMARY KEY (user_id, guide_id);


--
-- Name: idx_answer_votes_answer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_answer_votes_answer_id ON public.answer_votes USING btree (answer_id);


--
-- Name: idx_answers_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_answers_created_at ON public.answers USING btree (created_at DESC);


--
-- Name: idx_answers_question_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_answers_question_id ON public.answers USING btree (question_id);


--
-- Name: idx_answers_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_answers_user_id ON public.answers USING btree (user_id);


--
-- Name: idx_habit_completions_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_habit_completions_user_date ON public.habit_completions USING btree (user_id, completed_date DESC);


--
-- Name: idx_journey_appointments_user_starts; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_journey_appointments_user_starts ON public.journey_appointments USING btree (user_id, starts_at);


--
-- Name: idx_journey_entries_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_journey_entries_date ON public.journey_entries USING btree (date DESC);


--
-- Name: idx_journey_entries_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_journey_entries_user_date ON public.journey_entries USING btree (user_id, date DESC);


--
-- Name: idx_journey_entries_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_journey_entries_user_id ON public.journey_entries USING btree (user_id);


--
-- Name: idx_journey_milestones_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_journey_milestones_date ON public.journey_milestones USING btree (date_achieved DESC);


--
-- Name: idx_journey_milestones_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_journey_milestones_user ON public.journey_milestones USING btree (user_id, date_achieved DESC);


--
-- Name: idx_journey_milestones_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_journey_milestones_user_date ON public.journey_milestones USING btree (user_id, date_achieved DESC);


--
-- Name: idx_journey_milestones_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_journey_milestones_user_id ON public.journey_milestones USING btree (user_id);


--
-- Name: idx_journey_treatments_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_journey_treatments_is_active ON public.journey_treatments USING btree (is_active);


--
-- Name: idx_journey_treatments_user_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_journey_treatments_user_active ON public.journey_treatments USING btree (user_id, is_active);


--
-- Name: idx_journey_treatments_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_journey_treatments_user_id ON public.journey_treatments USING btree (user_id);


--
-- Name: idx_prevention_tips_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prevention_tips_active ON public.prevention_tips USING btree (is_active);


--
-- Name: idx_prevention_tips_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prevention_tips_category ON public.prevention_tips USING btree (category);


--
-- Name: idx_question_votes_question_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_question_votes_question_id ON public.question_votes USING btree (question_id);


--
-- Name: idx_questions_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_questions_category ON public.questions USING btree (category);


--
-- Name: idx_questions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_questions_created_at ON public.questions USING btree (created_at DESC);


--
-- Name: idx_questions_upvotes; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_questions_upvotes ON public.questions USING btree (upvotes DESC);


--
-- Name: idx_questions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_questions_user_id ON public.questions USING btree (user_id);


--
-- Name: idx_resources_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_resources_type ON public.resources USING btree (type);


--
-- Name: idx_resources_verified_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_resources_verified_active ON public.resources USING btree (is_verified, is_active);


--
-- Name: idx_self_check_guides_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_self_check_guides_active ON public.self_check_guides USING btree (is_active);


--
-- Name: idx_self_check_guides_cancer_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_self_check_guides_cancer_type ON public.self_check_guides USING btree (cancer_type);


--
-- Name: journey_appointments_user_starts_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX journey_appointments_user_starts_idx ON public.journey_appointments USING btree (user_id, starts_at);


--
-- Name: questions_cancer_type_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX questions_cancer_type_id_idx ON public.questions USING btree (cancer_type_id);


--
-- Name: journey_entries update_journey_entries_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_journey_entries_updated_at BEFORE UPDATE ON public.journey_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: journey_milestones update_journey_milestones_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_journey_milestones_updated_at BEFORE UPDATE ON public.journey_milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: journey_treatments update_journey_treatments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_journey_treatments_updated_at BEFORE UPDATE ON public.journey_treatments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: answer_votes answer_votes_answer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer_votes
    ADD CONSTRAINT answer_votes_answer_id_fkey FOREIGN KEY (answer_id) REFERENCES public.answers(id) ON DELETE CASCADE;


--
-- Name: answer_votes answer_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer_votes
    ADD CONSTRAINT answer_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: answers answers_parent_answer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_parent_answer_id_fkey FOREIGN KEY (parent_answer_id) REFERENCES public.answers(id) ON DELETE CASCADE;


--
-- Name: answers answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: answers answers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: article_bookmarks article_bookmarks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_bookmarks
    ADD CONSTRAINT article_bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: habit_bookmarks habit_bookmarks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.habit_bookmarks
    ADD CONSTRAINT habit_bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: habit_completions habit_completions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.habit_completions
    ADD CONSTRAINT habit_completions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: journey_appointments journey_appointments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journey_appointments
    ADD CONSTRAINT journey_appointments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: journey_entries journey_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journey_entries
    ADD CONSTRAINT journey_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: journey_milestones journey_milestones_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journey_milestones
    ADD CONSTRAINT journey_milestones_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: journey_treatments journey_treatments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journey_treatments
    ADD CONSTRAINT journey_treatments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: question_bookmarks question_bookmarks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_bookmarks
    ADD CONSTRAINT question_bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: question_votes question_votes_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_votes
    ADD CONSTRAINT question_votes_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: question_votes question_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_votes
    ADD CONSTRAINT question_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: questions questions_cancer_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_cancer_type_id_fkey FOREIGN KEY (cancer_type_id) REFERENCES public.cancer_types(id) ON DELETE SET NULL;


--
-- Name: questions questions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: reports reports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: resource_bookmarks resource_bookmarks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_bookmarks
    ADD CONSTRAINT resource_bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: self_check_progress self_check_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.self_check_progress
    ADD CONSTRAINT self_check_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: resources Allow admin to manage resources; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admin to manage resources" ON public.resources USING ((auth.role() = 'authenticated'::text));


--
-- Name: cancer_types Allow public read access to cancer types; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to cancer types" ON public.cancer_types FOR SELECT USING (true);


--
-- Name: resources Allow public read access to verified resources; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to verified resources" ON public.resources FOR SELECT USING (((is_verified = true) AND (is_active = true)));


--
-- Name: answer_votes Answer votes are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Answer votes are viewable by everyone" ON public.answer_votes FOR SELECT USING (true);


--
-- Name: answers Answers are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Answers are viewable by everyone" ON public.answers FOR SELECT USING (true);


--
-- Name: answers Anyone can insert answer with their auth id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert answer with their auth id" ON public.answers FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: questions Anyone can insert question with their auth id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert question with their auth id" ON public.questions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: prevention_tips Anyone can view active prevention tips; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active prevention tips" ON public.prevention_tips FOR SELECT USING ((is_active = true));


--
-- Name: self_check_guides Anyone can view active self-check guides; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active self-check guides" ON public.self_check_guides FOR SELECT USING ((is_active = true));


--
-- Name: answers Authenticated users can create answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create answers" ON public.answers FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: questions Authenticated users can create questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create questions" ON public.questions FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: answer_votes Authenticated users can vote on answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can vote on answers" ON public.answer_votes FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: question_votes Authenticated users can vote on questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can vote on questions" ON public.question_votes FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: answers Authors can delete own answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authors can delete own answers" ON public.answers FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: questions Authors can delete own questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authors can delete own questions" ON public.questions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: answers Authors can update own answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authors can update own answers" ON public.answers FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: questions Authors can update own questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authors can update own questions" ON public.questions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: answer_votes Only own answer votes are visible; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only own answer votes are visible" ON public.answer_votes AS RESTRICTIVE FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: question_votes Only own question votes are visible; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only own question votes are visible" ON public.question_votes AS RESTRICTIVE FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: cancer_types Public read access to cancer types; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read access to cancer types" ON public.cancer_types FOR SELECT TO authenticated, anon USING (true);


--
-- Name: prevention_tips Public read access to prevention tips; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read access to prevention tips" ON public.prevention_tips FOR SELECT TO authenticated, anon USING (true);


--
-- Name: resources Public read access to resources; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read access to resources" ON public.resources FOR SELECT TO authenticated, anon USING (true);


--
-- Name: self_check_guides Public read access to self-check guides; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read access to self-check guides" ON public.self_check_guides FOR SELECT TO authenticated, anon USING (true);


--
-- Name: question_votes Question votes are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Question votes are viewable by everyone" ON public.question_votes FOR SELECT USING (true);


--
-- Name: questions Questions are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Questions are viewable by everyone" ON public.questions FOR SELECT USING (true);


--
-- Name: answer_votes Users add their own answer votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users add their own answer votes" ON public.answer_votes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: journey_appointments Users add their own appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users add their own appointments" ON public.journey_appointments FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: habit_bookmarks Users add their own habit bookmarks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users add their own habit bookmarks" ON public.habit_bookmarks FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: habit_completions Users add their own habit completions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users add their own habit completions" ON public.habit_completions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: question_votes Users add their own question votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users add their own question votes" ON public.question_votes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: self_check_progress Users add their own self-checks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users add their own self-checks" ON public.self_check_progress FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: article_bookmarks Users can delete own article bookmarks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own article bookmarks" ON public.article_bookmarks FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: journey_entries Users can delete own journey entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own journey entries" ON public.journey_entries FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: journey_milestones Users can delete own milestones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own milestones" ON public.journey_milestones FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: question_bookmarks Users can delete own question bookmarks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own question bookmarks" ON public.question_bookmarks FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: resource_bookmarks Users can delete own resource bookmarks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own resource bookmarks" ON public.resource_bookmarks FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: journey_treatments Users can delete own treatments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own treatments" ON public.journey_treatments FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: answers Users can delete their own answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own answers" ON public.answers FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: questions Users can delete their own questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own questions" ON public.questions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: article_bookmarks Users can insert own article bookmarks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own article bookmarks" ON public.article_bookmarks FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: journey_entries Users can insert own journey entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own journey entries" ON public.journey_entries FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: journey_milestones Users can insert own milestones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own milestones" ON public.journey_milestones FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: question_bookmarks Users can insert own question bookmarks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own question bookmarks" ON public.question_bookmarks FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: resource_bookmarks Users can insert own resource bookmarks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own resource bookmarks" ON public.resource_bookmarks FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: journey_treatments Users can insert own treatments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own treatments" ON public.journey_treatments FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: answer_votes Users can remove their own votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can remove their own votes" ON public.answer_votes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: question_votes Users can remove their own votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can remove their own votes" ON public.question_votes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: journey_entries Users can update own journey entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own journey entries" ON public.journey_entries FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: journey_milestones Users can update own milestones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own milestones" ON public.journey_milestones FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: journey_treatments Users can update own treatments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own treatments" ON public.journey_treatments FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: answers Users can update their own answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own answers" ON public.answers FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: questions Users can update their own questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own questions" ON public.questions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: article_bookmarks Users can view own article bookmarks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own article bookmarks" ON public.article_bookmarks FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: journey_entries Users can view own journey entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own journey entries" ON public.journey_entries FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: journey_milestones Users can view own milestones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own milestones" ON public.journey_milestones FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: question_bookmarks Users can view own question bookmarks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own question bookmarks" ON public.question_bookmarks FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: resource_bookmarks Users can view own resource bookmarks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own resource bookmarks" ON public.resource_bookmarks FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: journey_treatments Users can view own treatments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own treatments" ON public.journey_treatments FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: journey_appointments Users change their own appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users change their own appointments" ON public.journey_appointments FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: habit_bookmarks Users change their own habit bookmarks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users change their own habit bookmarks" ON public.habit_bookmarks FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: habit_completions Users change their own habit completions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users change their own habit completions" ON public.habit_completions FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: self_check_progress Users change their own self-checks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users change their own self-checks" ON public.self_check_progress FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: journey_appointments Users delete their own appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users delete their own appointments" ON public.journey_appointments FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: habit_bookmarks Users delete their own habit bookmarks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users delete their own habit bookmarks" ON public.habit_bookmarks FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: habit_completions Users delete their own habit completions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users delete their own habit completions" ON public.habit_completions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: self_check_progress Users delete their own self-checks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users delete their own self-checks" ON public.self_check_progress FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: answer_votes Users manage their own answer votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage their own answer votes" ON public.answer_votes USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: journey_appointments Users manage their own appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage their own appointments" ON public.journey_appointments USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: habit_bookmarks Users manage their own habit bookmarks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage their own habit bookmarks" ON public.habit_bookmarks USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: habit_completions Users manage their own habit completions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage their own habit completions" ON public.habit_completions USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: journey_entries Users manage their own journey entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage their own journey entries" ON public.journey_entries USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: journey_milestones Users manage their own milestones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage their own milestones" ON public.journey_milestones USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: question_bookmarks Users manage their own question bookmarks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage their own question bookmarks" ON public.question_bookmarks USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: question_votes Users manage their own question votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage their own question votes" ON public.question_votes USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: resource_bookmarks Users manage their own resource bookmarks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage their own resource bookmarks" ON public.resource_bookmarks USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: self_check_progress Users manage their own self-check progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage their own self-check progress" ON public.self_check_progress USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: journey_treatments Users manage their own treatments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage their own treatments" ON public.journey_treatments USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: answer_votes Users read their own answer votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users read their own answer votes" ON public.answer_votes FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: journey_appointments Users read their own appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users read their own appointments" ON public.journey_appointments FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: habit_bookmarks Users read their own habit bookmarks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users read their own habit bookmarks" ON public.habit_bookmarks FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: habit_completions Users read their own habit completions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users read their own habit completions" ON public.habit_completions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: question_votes Users read their own question votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users read their own question votes" ON public.question_votes FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: self_check_progress Users read their own self-checks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users read their own self-checks" ON public.self_check_progress FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: answer_votes Users remove their own answer votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users remove their own answer votes" ON public.answer_votes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: question_votes Users remove their own question votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users remove their own question votes" ON public.question_votes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: reports Users send their own reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users send their own reports" ON public.reports FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: reports Users submit reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users submit reports" ON public.reports FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: answer_votes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.answer_votes ENABLE ROW LEVEL SECURITY;

--
-- Name: answers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

--
-- Name: article_bookmarks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.article_bookmarks ENABLE ROW LEVEL SECURITY;

--
-- Name: cancer_types; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cancer_types ENABLE ROW LEVEL SECURITY;

--
-- Name: habit_bookmarks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.habit_bookmarks ENABLE ROW LEVEL SECURITY;

--
-- Name: habit_completions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

--
-- Name: journey_appointments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.journey_appointments ENABLE ROW LEVEL SECURITY;

--
-- Name: journey_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.journey_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: journey_milestones; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.journey_milestones ENABLE ROW LEVEL SECURITY;

--
-- Name: journey_treatments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.journey_treatments ENABLE ROW LEVEL SECURITY;

--
-- Name: prevention_tips; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.prevention_tips ENABLE ROW LEVEL SECURITY;

--
-- Name: question_bookmarks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.question_bookmarks ENABLE ROW LEVEL SECURITY;

--
-- Name: question_votes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.question_votes ENABLE ROW LEVEL SECURITY;

--
-- Name: questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

--
-- Name: reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

--
-- Name: resource_bookmarks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.resource_bookmarks ENABLE ROW LEVEL SECURITY;

--
-- Name: resources; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

--
-- Name: self_check_guides; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.self_check_guides ENABLE ROW LEVEL SECURITY;

--
-- Name: self_check_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.self_check_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION decrement_answer_count(question_id_param uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.decrement_answer_count(question_id_param uuid) TO anon;
GRANT ALL ON FUNCTION public.decrement_answer_count(question_id_param uuid) TO authenticated;
GRANT ALL ON FUNCTION public.decrement_answer_count(question_id_param uuid) TO service_role;


--
-- Name: FUNCTION decrement_answer_upvotes(answer_id_param uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.decrement_answer_upvotes(answer_id_param uuid) TO anon;
GRANT ALL ON FUNCTION public.decrement_answer_upvotes(answer_id_param uuid) TO authenticated;
GRANT ALL ON FUNCTION public.decrement_answer_upvotes(answer_id_param uuid) TO service_role;


--
-- Name: FUNCTION decrement_question_upvotes(question_id_param uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.decrement_question_upvotes(question_id_param uuid) TO anon;
GRANT ALL ON FUNCTION public.decrement_question_upvotes(question_id_param uuid) TO authenticated;
GRANT ALL ON FUNCTION public.decrement_question_upvotes(question_id_param uuid) TO service_role;


--
-- Name: FUNCTION increment_answer_count(question_id_param uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.increment_answer_count(question_id_param uuid) TO anon;
GRANT ALL ON FUNCTION public.increment_answer_count(question_id_param uuid) TO authenticated;
GRANT ALL ON FUNCTION public.increment_answer_count(question_id_param uuid) TO service_role;


--
-- Name: FUNCTION increment_answer_upvotes(answer_id_param uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.increment_answer_upvotes(answer_id_param uuid) TO anon;
GRANT ALL ON FUNCTION public.increment_answer_upvotes(answer_id_param uuid) TO authenticated;
GRANT ALL ON FUNCTION public.increment_answer_upvotes(answer_id_param uuid) TO service_role;


--
-- Name: FUNCTION increment_question_upvotes(question_id_param uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.increment_question_upvotes(question_id_param uuid) TO anon;
GRANT ALL ON FUNCTION public.increment_question_upvotes(question_id_param uuid) TO authenticated;
GRANT ALL ON FUNCTION public.increment_question_upvotes(question_id_param uuid) TO service_role;


--
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;


--
-- Name: TABLE answer_votes; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.answer_votes TO anon;
GRANT ALL ON TABLE public.answer_votes TO authenticated;
GRANT ALL ON TABLE public.answer_votes TO service_role;


--
-- Name: TABLE answers; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.answers TO anon;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.answers TO authenticated;
GRANT ALL ON TABLE public.answers TO service_role;


--
-- Name: COLUMN answers.id; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(id) ON TABLE public.answers TO anon;
GRANT SELECT(id) ON TABLE public.answers TO authenticated;


--
-- Name: COLUMN answers.question_id; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(question_id) ON TABLE public.answers TO anon;
GRANT SELECT(question_id) ON TABLE public.answers TO authenticated;


--
-- Name: COLUMN answers.content; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(content) ON TABLE public.answers TO anon;
GRANT SELECT(content) ON TABLE public.answers TO authenticated;


--
-- Name: COLUMN answers.user_name; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(user_name) ON TABLE public.answers TO anon;
GRANT SELECT(user_name) ON TABLE public.answers TO authenticated;


--
-- Name: COLUMN answers.is_anonymous; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(is_anonymous) ON TABLE public.answers TO anon;
GRANT SELECT(is_anonymous) ON TABLE public.answers TO authenticated;


--
-- Name: COLUMN answers.upvotes; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(upvotes) ON TABLE public.answers TO anon;
GRANT SELECT(upvotes) ON TABLE public.answers TO authenticated;


--
-- Name: COLUMN answers.created_at; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(created_at) ON TABLE public.answers TO anon;
GRANT SELECT(created_at) ON TABLE public.answers TO authenticated;


--
-- Name: COLUMN answers.updated_at; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(updated_at) ON TABLE public.answers TO anon;
GRANT SELECT(updated_at) ON TABLE public.answers TO authenticated;


--
-- Name: COLUMN answers.is_accepted; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(is_accepted) ON TABLE public.answers TO anon;
GRANT SELECT(is_accepted) ON TABLE public.answers TO authenticated;


--
-- Name: COLUMN answers.parent_answer_id; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(parent_answer_id) ON TABLE public.answers TO anon;
GRANT SELECT(parent_answer_id) ON TABLE public.answers TO authenticated;


--
-- Name: TABLE answers_public; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.answers_public TO anon;
GRANT ALL ON TABLE public.answers_public TO authenticated;
GRANT ALL ON TABLE public.answers_public TO service_role;


--
-- Name: TABLE article_bookmarks; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.article_bookmarks TO anon;
GRANT ALL ON TABLE public.article_bookmarks TO authenticated;
GRANT ALL ON TABLE public.article_bookmarks TO service_role;


--
-- Name: TABLE cancer_types; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.cancer_types TO anon;
GRANT ALL ON TABLE public.cancer_types TO authenticated;
GRANT ALL ON TABLE public.cancer_types TO service_role;


--
-- Name: TABLE habit_bookmarks; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.habit_bookmarks TO anon;
GRANT ALL ON TABLE public.habit_bookmarks TO authenticated;
GRANT ALL ON TABLE public.habit_bookmarks TO service_role;


--
-- Name: TABLE habit_completions; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.habit_completions TO anon;
GRANT ALL ON TABLE public.habit_completions TO authenticated;
GRANT ALL ON TABLE public.habit_completions TO service_role;


--
-- Name: TABLE journey_appointments; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.journey_appointments TO anon;
GRANT ALL ON TABLE public.journey_appointments TO authenticated;
GRANT ALL ON TABLE public.journey_appointments TO service_role;


--
-- Name: TABLE journey_entries; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.journey_entries TO anon;
GRANT ALL ON TABLE public.journey_entries TO authenticated;
GRANT ALL ON TABLE public.journey_entries TO service_role;


--
-- Name: TABLE journey_milestones; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.journey_milestones TO anon;
GRANT ALL ON TABLE public.journey_milestones TO authenticated;
GRANT ALL ON TABLE public.journey_milestones TO service_role;


--
-- Name: TABLE journey_treatments; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.journey_treatments TO anon;
GRANT ALL ON TABLE public.journey_treatments TO authenticated;
GRANT ALL ON TABLE public.journey_treatments TO service_role;


--
-- Name: TABLE prevention_tips; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.prevention_tips TO anon;
GRANT ALL ON TABLE public.prevention_tips TO authenticated;
GRANT ALL ON TABLE public.prevention_tips TO service_role;


--
-- Name: TABLE question_bookmarks; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.question_bookmarks TO anon;
GRANT ALL ON TABLE public.question_bookmarks TO authenticated;
GRANT ALL ON TABLE public.question_bookmarks TO service_role;


--
-- Name: TABLE question_votes; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.question_votes TO anon;
GRANT ALL ON TABLE public.question_votes TO authenticated;
GRANT ALL ON TABLE public.question_votes TO service_role;


--
-- Name: TABLE questions; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.questions TO anon;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.questions TO authenticated;
GRANT ALL ON TABLE public.questions TO service_role;


--
-- Name: COLUMN questions.id; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(id) ON TABLE public.questions TO anon;
GRANT SELECT(id) ON TABLE public.questions TO authenticated;


--
-- Name: COLUMN questions.title; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(title) ON TABLE public.questions TO anon;
GRANT SELECT(title) ON TABLE public.questions TO authenticated;


--
-- Name: COLUMN questions.content; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(content) ON TABLE public.questions TO anon;
GRANT SELECT(content) ON TABLE public.questions TO authenticated;


--
-- Name: COLUMN questions.category; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(category) ON TABLE public.questions TO anon;
GRANT SELECT(category) ON TABLE public.questions TO authenticated;


--
-- Name: COLUMN questions.user_name; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(user_name) ON TABLE public.questions TO anon;
GRANT SELECT(user_name) ON TABLE public.questions TO authenticated;


--
-- Name: COLUMN questions.is_anonymous; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(is_anonymous) ON TABLE public.questions TO anon;
GRANT SELECT(is_anonymous) ON TABLE public.questions TO authenticated;


--
-- Name: COLUMN questions.upvotes; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(upvotes) ON TABLE public.questions TO anon;
GRANT SELECT(upvotes) ON TABLE public.questions TO authenticated;


--
-- Name: COLUMN questions.answer_count; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(answer_count) ON TABLE public.questions TO anon;
GRANT SELECT(answer_count) ON TABLE public.questions TO authenticated;


--
-- Name: COLUMN questions.created_at; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(created_at) ON TABLE public.questions TO anon;
GRANT SELECT(created_at) ON TABLE public.questions TO authenticated;


--
-- Name: COLUMN questions.updated_at; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(updated_at) ON TABLE public.questions TO anon;
GRANT SELECT(updated_at) ON TABLE public.questions TO authenticated;


--
-- Name: COLUMN questions.is_resolved; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(is_resolved) ON TABLE public.questions TO anon;
GRANT SELECT(is_resolved) ON TABLE public.questions TO authenticated;


--
-- Name: COLUMN questions.tags; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(tags) ON TABLE public.questions TO anon;
GRANT SELECT(tags) ON TABLE public.questions TO authenticated;


--
-- Name: COLUMN questions.profile_picture_url; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(profile_picture_url) ON TABLE public.questions TO anon;
GRANT SELECT(profile_picture_url) ON TABLE public.questions TO authenticated;


--
-- Name: COLUMN questions.cancer_type_id; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(cancer_type_id) ON TABLE public.questions TO anon;
GRANT SELECT(cancer_type_id) ON TABLE public.questions TO authenticated;


--
-- Name: TABLE questions_public; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.questions_public TO anon;
GRANT ALL ON TABLE public.questions_public TO authenticated;
GRANT ALL ON TABLE public.questions_public TO service_role;


--
-- Name: TABLE reports; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.reports TO anon;
GRANT ALL ON TABLE public.reports TO authenticated;
GRANT ALL ON TABLE public.reports TO service_role;


--
-- Name: TABLE resource_bookmarks; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.resource_bookmarks TO anon;
GRANT ALL ON TABLE public.resource_bookmarks TO authenticated;
GRANT ALL ON TABLE public.resource_bookmarks TO service_role;


--
-- Name: TABLE resources; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.resources TO anon;
GRANT ALL ON TABLE public.resources TO authenticated;
GRANT ALL ON TABLE public.resources TO service_role;


--
-- Name: TABLE self_check_guides; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.self_check_guides TO anon;
GRANT ALL ON TABLE public.self_check_guides TO authenticated;
GRANT ALL ON TABLE public.self_check_guides TO service_role;


--
-- Name: TABLE self_check_progress; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.self_check_progress TO anon;
GRANT ALL ON TABLE public.self_check_progress TO authenticated;
GRANT ALL ON TABLE public.self_check_progress TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict t7EYMc9bkbygc5zcB5h6ZG3OWHmojYLJifZ8esA9ePaK73N6s9M51cEj04e8pOF

