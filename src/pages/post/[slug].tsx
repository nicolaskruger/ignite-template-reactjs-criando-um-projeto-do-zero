import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { AiOutlineCalendar, AiOutlineUser, AiOutlineClockCircle } from 'react-icons/ai';
import { getPrismicClient } from '../../services/prismic';

import Link from "next/link";
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { dateFormat, lastDateFormat } from '../../services/dateFormat';
import { useRouter } from 'next/router';
import { FC, useEffect } from 'react';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  uid: string;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  next: Post | null;
  prev: Post | null;
}

const NavigatorPost: FC<{ post: Post, label: string }> = ({ post, label }) => {

  const { push } = useRouter();

  return (
    <button type='button' onClick={() => push(`/post/${post.uid}`)}>
      <h3>
        {post.data.title}
      </h3>
      <p>{label}</p>
    </button>
  )
}

const Post: NextPage<PostProps> = ({ post, prev, next }) => {
  // TODO

  const router = useRouter();

  const timeToRead = (post: Post) => {
    const words = post.data.content.reduce((acc, curr) => {
      return (
        acc +
        curr.heading.split(' ').length +
        curr.body.reduce((acc, curr) => {
          return acc + curr.text.split(' ').length;
        }, 0)
      );
    }, 0);
    return Math.ceil(words / 200.0);
  };

  if (router.isFallback || !post) {
    return <div>Carregando...</div>
  }

  useEffect(() => {
    let script = document.createElement("script");
    let anchor = document.getElementById("inject-comments-for-uterances");
    script.setAttribute("src", "https://utteranc.es/client.js");
    script.setAttribute("crossorigin", "anonymous");
    script.setAttribute("async", true);
    script.setAttribute("repo", "nicolaskruger/ignite-template-reactjs-criando-um-projeto-do-zero");
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("theme", "github-dark");
    anchor.appendChild(script);
    return () => {
      anchor.removeChild(script);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Zero Project | Posts</title>
      </Head>
      <main className={styles.container}>
        <img src={post.data.banner.url} alt="banner" />
        <section>
          <h1>{post.data.title}</h1>
          <span>
            <div>
              <AiOutlineCalendar />
              <p>{dateFormat(post.first_publication_date)}</p>
            </div>
            <div>
              <AiOutlineUser />
              <p>{post.data.author}</p>
            </div>
            <div>
              <AiOutlineClockCircle />
              <p>{`${timeToRead(post)} min`}</p>
            </div>
          </span>
          <p>{`*editado em ${dateFormat(post.last_publication_date)}, as ${lastDateFormat(post.last_publication_date)}`}</p>
          {post.data.content.map((content, index) => {
            return (
              <div key={index}>
                <h2>{content.heading}</h2>
                {content.body.map(body => {
                  return (
                    <div dangerouslySetInnerHTML={{ __html: body.text }} />
                  );
                })}
              </div>
            );
          })}
          <nav className={styles.Nav}>
            <div />
            <span>
              {prev ? (
                <NavigatorPost post={prev} label='Post anterior' />
              ) : (<button />)}
              {next ? (
                <NavigatorPost post={next} label='Pr??ximo post' />
              ) : (<button />)}
            </span>
          </nav>
          <div id="inject-comments-for-uterances"></div>
        </section>

      </main>
    </>
  );
};

export default Post;

type Path = {
  slug: string;
};

export const getStaticPaths: GetStaticPaths<Path> = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {}
  );

  return {
    paths: posts.results.map(post => ({ params: { slug: post.uid } })),
    fallback: true,
  };
  // TODO
};

export const getStaticProps: GetStaticProps<PostProps> = async context => {
  const { slug } = context.params;


  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {

  });

  const nextResponse = (await prismic.query(
    // Replace `article` with your doc type
    Prismic.Predicates.at('document.type', 'posts'),
    {
      pageSize: 1,
      after: response?.id,
      orderings: '[document.first_publication_date desc]',
    },
  )).results[0] || null;
  const prevResponse = (await prismic.query(
    // Replace `post` with your doc type
    Prismic.Predicates.at('document.type', 'posts'),
    {
      pageSize: 1,
      after: response?.id,
      orderings: '[document.first_publication_date]',
    },
  )).results[0] || null;

  // TODO
  return {
    props: {
      next: nextResponse,
      prev: prevResponse,
      post: {
        ...response,
        first_publication_date: response.first_publication_date,
        data: {
          ...response.data,
          author: response.data.author,
          banner: response.data.banner,
          title: response.data.title,
          content: response.data.content,
        },
      },
    },
    revalidate: 60 * 60, //1h
  };
};
