import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { AiOutlineCalendar, AiOutlineUser, AiOutlineClockCircle } from 'react-icons/ai';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { dateFormat } from '../../services/dateFormat';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
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
}

const Post: NextPage<PostProps> = ({ post }) => {
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

  // TODO
  return {
    props: {
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
