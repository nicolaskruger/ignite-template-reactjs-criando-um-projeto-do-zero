import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { AiOutlineCalendar, AiOutlineUser, AiOutlineClockCircle } from 'react-icons/ai';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

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

  if (!post) {
    return <div>Carregando...</div>
  }

  return (
    <>
      <Head>
        <title>Zero Project | Posts</title>
      </Head>
      <main className={styles.container}>
        <img src={post.data.banner} alt="banner" />
        <section>
          <h1>{post.data.title}</h1>
          <span>
            <div>
              <AiOutlineCalendar />
              <p>{post.first_publication_date}</p>
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
          {post.data.content.map(content => {
            return (
              <>
                <h2>{content.heading}</h2>
                {content.body.map(body => {
                  return (
                    <div dangerouslySetInnerHTML={{ __html: body.text }} />
                  );
                })}
              </>
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
  // const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);

  return {
    paths: [],
    fallback: true,
  };
  // TODO
};

export const getStaticProps: GetStaticProps<PostProps> = async context => {
  // const prismic = getPrismicClient();
  // const response = await prismic.getByUID(TODO);

  // TODO
  return {
    props: {
      post: {
        first_publication_date: '2006',
        data: {
          author: 'nicolas kruger',
          banner:
            'https://cdn.myanimelist.net/r/360x360/images/anime/7/77356.jpg?s=2a688b88a34e61d4cbc0c75dfbc77a49',
          title: 'FLCL',
          content: [
            {
              heading: 'flcl',
              body: [
                {
                  text: 'flcl '.repeat(20),
                },
              ],
            },
          ],
        },
      },
    },
    revalidate: 60 * 60, //1h
  };
};
