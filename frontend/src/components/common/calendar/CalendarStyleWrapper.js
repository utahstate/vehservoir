import styled from '@emotion/styled';

export const CalendarStyleWrapper = styled.div`
  h2 {
    color: #595959;
  }

  .fc .fc-button-primary {
    background: #151515;
    border-radius: 0px;
    border: 1px solid #151515;
  }

  .fc .fc-button-primary:hover {
    background: none;
    color: #000;
  }

  .fc-col-header {
    margin: 0px;
  }

  .fc-timegrid-slots table {
    margin: 0px;
  }

  .fc-timegrid-cols table {
    margin: 0px;
  }

  .fc-timegrid table {
    margin: 0;
  }

  .fc .fc-toolbar.fc-header-toolbar {
    margin: 0px;
    padding: 10px;
    border: 1px solid #dddddd;
    border-bottom: none;
    background: #dddddd;
  }

  .fc-toolbar-chunk > .fc-customTitle-button {
    background: none;
    color: #151515;
    font-weight: 900;
    font-size: 23px;
    padding: 0;
    border: none;
  }

  .fc-customTitle-button:hover {
    cursor: text;
  }

  .fc-event {
    background: #1a95e0;
    border-radius: 0px;
    border: 1px solid #1a95e0;
  }
`;
