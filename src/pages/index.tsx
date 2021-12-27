import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { AiOutlineCalendar, AiOutlineUser } from 'react-icons/ai';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
import { useState } from 'react';
import { useRouter } from 'next/router';

const toPostPaginator = (response: ApiSearchResponse): PostPagination => {
  const data: Post[] = response.results.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      author: post.data.author,
      subtitle: post.data.subtitle,
      title: post.data.title,
    },
  }));
  return {
    results: data,
    next_page: response.next_page,
  };
};
interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

const Home: NextPage<HomeProps> = ({ postsPagination }) => {
  // TODO

  const [post, setPost] = useState(postsPagination);

  const route = useRouter();

  const handleClickPost = (uid: string) => {
    route.push(`/post/${uid}`, `/post/${uid}`, {});
  };

  const handleLoadMore = async () => {
    const result = await fetch(post.next_page);
    const data: PostPagination = toPostPaginator(await result.json());
    setPost({
      next_page: data.next_page,
      results: [...post.results, ...data.results],
    });
  };

  return (
    <>
      <Head>
        <title>Zero Project | Home</title>
      </Head>
      <main className={styles.container}>
        {post.results.map(result => (
          <button key={result.uid} type="button" onClick={() => handleClickPost(result.uid)}>
            <h1>{result.data.title}</h1>
            <p>{result.data.subtitle}</p>
            <div>
              <div>
                <AiOutlineCalendar />
                <time>
                  {format(
                    new Date(result.first_publication_date),
                    'dd LLL yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </time>
              </div>
              <div>
                <AiOutlineUser />
                <span>{result.data.author}</span>
              </div>
            </div>
          </button>
        ))}
        {post.next_page !== null && <button onClick={handleLoadMore} className={styles.loadMore}>Carregar mais posts</button>}
      </main>
    </>
  );
};

export default Home;


export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      fetch: ['posts.title', 'posts.author', 'posts.subtitle'],
    }
  );

  // TODO

  return {
    props: {
      postsPagination: toPostPaginator(postsResponse),
    },
    revalidate: 60 * 30, // 1h
  };
};
