import React, { PureComponent } from 'react'
import { Link }                 from "react-router-dom";
import { BeatLoader }           from 'react-spinners';
import { FormattedMessage }     from 'react-intl';

import styles                   from './NewsListComponent.css'
import { epoch2FullDate,
         epoch2ReadFormat }     from '../utils/utilDatetime'
import { isUnRead,
         getSummaryTemplate,
         toJson }               from '../utils/utils'

import * as constants           from '../constants/Constants'


class NewsListComponent extends PureComponent {
  constructor(props) {
    super();
    this.onListItemClick = this.onListItemClick.bind(this)
  }

  onListItemClick(e, index, itemLink) {
    const { itemClicked } = this.props
    itemClicked()
  }

  render() {
    const { listData, isLoading } = this.props

    return (
      <div className={styles['root']}>
          {
            (listData.length === 0)? (
              <div className={styles['no-content-message']}>
                <FormattedMessage
                  id="news-list-component.message"
                  defaultMessage="There are no new artilces"
                />
              </div>
            ):null
          }
          {
            listData.map((item, index) => {

              if (item.Status !== constants.STATUS_ARRAY.indexOf('StatusAlive')) {
                return null
              }

              const itemLink = '/board/' + encodeURIComponent(item.BoardID) + '/article/' + encodeURIComponent(item.ID)

              let summary = ''
              if (item.Summary) {
                let sData = toJson(item.Summary)
                summary = getSummaryTemplate(sData, { CreatorName: item.CreatorName, boardId: item.BoardID })
              }

              return (
                <div className={styles['list-item']} key={index} onClick={(e) => this.onListItemClick(e, index, itemLink)}>
                  <Link to={itemLink}>
                    <div className={styles['list-item-author']}>
                      <div className={styles['list-item-author-pic']}>
                        <img src={item.CreatorImg || constants.DEFAULT_USER_IMAGE} alt={'Creator Profile'}/>
                      </div>
                      <div title={item.CreatorName} className={styles['list-item-author-name']}>
                        {item.CreatorName}
                      </div>
                    </div>
                    <div className={styles['list-item-main']}>
                      <div className={styles['list-item-header']}>
                        <div title={item.Title} className={isUnRead(item.CreateTS.T, item.LastSeen.T)? styles['list-item-title-unread']:styles['list-item-title']}>
                          {item.Title}
                        </div>
                        <div title={epoch2FullDate(item.UpdateTS.T)} className={styles['list-item-time']}>
                          {epoch2ReadFormat(item.UpdateTS.T)}
                        </div>
                      </div>
                      <div className={styles['list-item-boardname']}>
                        <div className={styles['list-item-board-tag']}>
                          {item.BoardName}
                        </div>
                      </div>
                      <div className={styles['list-item-content']}>
                      {
                        summary ? (
                          <div dangerouslySetInnerHTML={{__html: summary}} />
                        ):(
                          <FormattedMessage id="news-list-component.empty" defaultMessage="(No content)" />
                        )
                      }
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })
          }
          <div className={styles['spinner-item']}>
            <BeatLoader color={'#aaa'} size={8} loading={isLoading}/>
          </div>
      </div>
    )
  }
}

export default NewsListComponent
