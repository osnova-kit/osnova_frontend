import PageContainer from '../../components/PageContainer/PageContainer';
import SchemaForm from '../../components/SchemaForm/SchemaForm';
import Seo from '../../components/Seo/Seo';

const Contact = () => (
  <PageContainer maxWidth={640}>
    <Seo page="contact" />
    <SchemaForm name="contact" />
  </PageContainer>
);

export default Contact;
