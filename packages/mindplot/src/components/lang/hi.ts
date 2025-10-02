/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

interface LanguageStrings {
  [key: string]: string;
  LOADING: string;
  SAVING: string;
  SAVE_COMPLETE: string;
  ZOOM_IN_ERROR: string;
  ZOOM_ERROR: string;
  ONLY_ONE_TOPIC_MUST_BE_SELECTED: string;
  ONE_TOPIC_MUST_BE_SELECTED: string;
  ONLY_ONE_TOPIC_MUST_BE_SELECTED_COLLAPSE: string;
  SAVE_COULD_NOT_BE_COMPLETED: string;
  MAIN_TOPIC: string;
  SUB_TOPIC: string;
  ISOLATED_TOPIC: string;
  CENTRAL_TOPIC: string;
  ENTITIES_COULD_NOT_BE_DELETED: string;
  CLIPBOARD_IS_EMPTY: string;
  CENTRAL_TOPIC_CAN_NOT_BE_DELETED: string;
  RELATIONSHIP_COULD_NOT_BE_CREATED: string;
  SESSION_EXPIRED: string;
  CENTRAL_TOPIC_CONNECTION_STYLE_CAN_NOT_BE_CHANGED: string;
  CENTRAL_TOPIC_STYLE_CAN_NOT_BE_CHANGED: string;
}

const HI: LanguageStrings = {
  LOADING: 'लोड हो रहा है ..',
  SAVING: 'सहेजा जा रहा है ...',
  SAVE_COMPLETE: 'सहेजना पूरा हो गया',
  ZOOM_IN_ERROR: 'ज़ूम बहुत अधिक है।',
  ZOOM_ERROR: 'अधिक ज़ूम नहीं किया जा सकता।',
  ONLY_ONE_TOPIC_MUST_BE_SELECTED: 'विषय नहीं बनाया जा सका। केवल एक विषय का चयन किया जाना चाहिए।',
  ONE_TOPIC_MUST_BE_SELECTED: 'विषय नहीं बनाया जा सका। एक विषय का चयन किया जाना चाहिए।',
  ONLY_ONE_TOPIC_MUST_BE_SELECTED_COLLAPSE: 'बच्चों को समेटा नहीं जा सकता। एक विषय का चयन किया जाना चाहिए।',
  SAVE_COULD_NOT_BE_COMPLETED: 'सहेजना पूरा नहीं हो सका, कृपया बाद में फिर से कोशिश करें।',
  MAIN_TOPIC: 'मुख्य विषय',
  SUB_TOPIC: 'उप विषय',
  ISOLATED_TOPIC: 'अलग विषय',
  CENTRAL_TOPIC: 'केंद्रीय विषय',
  ENTITIES_COULD_NOT_BE_DELETED: 'विषय या संबंध नहीं हटाया जा सका। कम से कम एक मानचित्र इकाई का चयन किया जाना चाहिए।',
  CLIPBOARD_IS_EMPTY: 'कॉपी करने के लिए कुछ नहीं। क्लिपबोर्ड खाली है।',
  CENTRAL_TOPIC_CAN_NOT_BE_DELETED: 'केंद्रीय विषय को हटाया नहीं जा सकता।',
  RELATIONSHIP_COULD_NOT_BE_CREATED: 'संबंध नहीं बनाया जा सका। पहले एक मूल संबंध विषय का चयन किया जाना चाहिए।',
  SESSION_EXPIRED: 'आपका सत्र समाप्त हो गया है, कृपया फिर से लॉग इन करें।',
  CENTRAL_TOPIC_CONNECTION_STYLE_CAN_NOT_BE_CHANGED: 'केंद्रीय विषय के लिए कनेक्शन शैली नहीं बदली जा सकती।',
  CENTRAL_TOPIC_STYLE_CAN_NOT_BE_CHANGED: 'केंद्रीय विषय को लाइन शैली में नहीं बदला जा सकता।',
};

export default HI;
