// File: app/api-doc/page.tsx
import { getApiDocs } from '../../../lib/swagger.ts';
import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default async function ApiDocPage() {
  const spec = await getApiDocs();
  return (
    <section className="container">
      <SwaggerUI spec={spec} />
    </section>
  );
}