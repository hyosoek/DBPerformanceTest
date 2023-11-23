--
-- PostgreSQL database dump
--

-- Dumped from database version 12.16 (Ubuntu 12.16-0ubuntu0.20.04.1)
-- Dumped by pg_dump version 12.16 (Ubuntu 12.16-0ubuntu0.20.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry, geography, and raster spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account (
    id integer NOT NULL,
    mail character varying(100) NOT NULL,
    pw character varying(20) NOT NULL,
    nickname character varying(20) NOT NULL,
    longitude double precision NOT NULL,
    latitude double precision NOT NULL
);


ALTER TABLE public.account OWNER TO postgres;

--
-- Name: account_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.account_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.account_id_seq OWNER TO postgres;

--
-- Name: account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.account_id_seq OWNED BY public.account.id;


--
-- Name: air_conditioner; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.air_conditioner (
    id integer NOT NULL,
    account_id integer NOT NULL,
    energy real NOT NULL,
    co2 real NOT NULL,
    model_name character varying(50) NOT NULL
);


ALTER TABLE public.air_conditioner OWNER TO postgres;

--
-- Name: air_conditioner_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.air_conditioner_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.air_conditioner_id_seq OWNER TO postgres;

--
-- Name: air_conditioner_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.air_conditioner_id_seq OWNED BY public.air_conditioner.id;


--
-- Name: television; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.television (
    id integer NOT NULL,
    account_id integer NOT NULL,
    energy real NOT NULL,
    co2 real NOT NULL,
    model_name character varying(50) NOT NULL
);


ALTER TABLE public.television OWNER TO postgres;

--
-- Name: television_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.television_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.television_id_seq OWNER TO postgres;

--
-- Name: television_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.television_id_seq OWNED BY public.television.id;


--
-- Name: boiler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.boiler (
    id integer DEFAULT nextval('public.television_id_seq'::regclass) NOT NULL,
    account_id integer NOT NULL,
    model_name character varying(50) NOT NULL,
    efficiency real NOT NULL,
    gas_consumption real NOT NULL,
    output real
);


ALTER TABLE public.boiler OWNER TO postgres;

--
-- Name: dryer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dryer (
    id integer DEFAULT nextval('public.television_id_seq'::regclass) NOT NULL,
    account_id integer NOT NULL,
    energy real NOT NULL,
    co2 real NOT NULL,
    model_name character varying(50) NOT NULL
);


ALTER TABLE public.dryer OWNER TO postgres;

--
-- Name: microwave; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.microwave (
    id integer DEFAULT nextval('public.television_id_seq'::regclass) NOT NULL,
    account_id integer NOT NULL,
    energy real NOT NULL,
    model_name character varying(50) NOT NULL
);


ALTER TABLE public.microwave OWNER TO postgres;

--
-- Name: refrigerator; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refrigerator (
    id integer NOT NULL,
    account_id integer NOT NULL,
    energy real NOT NULL,
    co2 real NOT NULL,
    model_name character varying(50) NOT NULL
);


ALTER TABLE public.refrigerator OWNER TO postgres;

--
-- Name: refrigirator_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.refrigirator_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.refrigirator_id_seq OWNER TO postgres;

--
-- Name: refrigirator_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.refrigirator_id_seq OWNED BY public.refrigerator.id;


--
-- Name: washing_machine; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.washing_machine (
    id integer NOT NULL,
    account_id integer NOT NULL,
    energy real NOT NULL,
    co2 real NOT NULL,
    model_name character varying(50) NOT NULL
);


ALTER TABLE public.washing_machine OWNER TO postgres;

--
-- Name: washing_machine_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.washing_machine_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.washing_machine_id_seq OWNER TO postgres;

--
-- Name: washing_machine_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.washing_machine_id_seq OWNED BY public.washing_machine.id;


--
-- Name: account id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account ALTER COLUMN id SET DEFAULT nextval('public.account_id_seq'::regclass);


--
-- Name: air_conditioner id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.air_conditioner ALTER COLUMN id SET DEFAULT nextval('public.air_conditioner_id_seq'::regclass);


--
-- Name: refrigerator id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refrigerator ALTER COLUMN id SET DEFAULT nextval('public.refrigirator_id_seq'::regclass);


--
-- Name: television id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.television ALTER COLUMN id SET DEFAULT nextval('public.television_id_seq'::regclass);


--
-- Name: washing_machine id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.washing_machine ALTER COLUMN id SET DEFAULT nextval('public.washing_machine_id_seq'::regclass);


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account (id, mail, pw, nickname, longitude, latitude) FROM stdin;
\.


--
-- Data for Name: air_conditioner; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.air_conditioner (id, account_id, energy, co2, model_name) FROM stdin;
\.


--
-- Data for Name: boiler; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.boiler (id, account_id, model_name, efficiency, gas_consumption, output) FROM stdin;
\.


--
-- Data for Name: dryer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dryer (id, account_id, energy, co2, model_name) FROM stdin;
\.


--
-- Data for Name: microwave; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.microwave (id, account_id, energy, model_name) FROM stdin;
\.


--
-- Data for Name: refrigerator; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refrigerator (id, account_id, energy, co2, model_name) FROM stdin;
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: ubuntu
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: television; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.television (id, account_id, energy, co2, model_name) FROM stdin;
\.


--
-- Data for Name: washing_machine; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.washing_machine (id, account_id, energy, co2, model_name) FROM stdin;
\.


--
-- Name: account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.account_id_seq', 200650, true);


--
-- Name: air_conditioner_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.air_conditioner_id_seq', 10002, true);


--
-- Name: refrigirator_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refrigirator_id_seq', 10003, true);


--
-- Name: television_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.television_id_seq', 1, false);


--
-- Name: washing_machine_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.washing_machine_id_seq', 1, false);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: account mail_unique_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT mail_unique_key UNIQUE (mail);


--
-- Name: account nickname_unique_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT nickname_unique_key UNIQUE (nickname);


--
-- Name: air_conditioner air_conditioner_pkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.air_conditioner
    ADD CONSTRAINT air_conditioner_pkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: boiler boiler_pkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.boiler
    ADD CONSTRAINT boiler_pkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: dryer dryer_pkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dryer
    ADD CONSTRAINT dryer_pkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: microwave microwave_pkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.microwave
    ADD CONSTRAINT microwave_pkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: refrigerator refrigirator_pkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refrigerator
    ADD CONSTRAINT refrigirator_pkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: television television_pkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.television
    ADD CONSTRAINT television_pkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: washing_machine washing_machine_pkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.washing_machine
    ADD CONSTRAINT washing_machine_pkey FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

